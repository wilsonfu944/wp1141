import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feed = searchParams.get("feed") || "all";

    let posts;

    if (feed === "following") {
      // Get posts from followed users
      const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      });

      const followingIds = following.map((f) => f.followingId);

      posts = await prisma.post.findMany({
        where: {
          OR: [
            { authorId: { in: followingIds }, parentId: null },
            {
              reposts: {
                some: { userId: { in: followingIds } },
              },
            },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              userId: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              reposts: true,
              comments: true,
            },
          },
          likes: {
            where: { userId: session.user.id },
            select: { id: true },
          },
          reposts: {
            where: { userId: session.user.id },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } else {
      // Get all posts
      posts = await prisma.post.findMany({
        where: { parentId: null },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              userId: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              reposts: true,
              comments: true,
            },
          },
          likes: {
            where: { userId: session.user.id },
            select: { id: true },
          },
          reposts: {
            where: { userId: session.user.id },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }

    // Add isLiked and isReposted flags
    const postsWithFlags = posts.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      isReposted: post.reposts.length > 0,
      likes: undefined,
      reposts: undefined,
    }));

    return NextResponse.json({ posts: postsWithFlags });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, parentId } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            userId: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: true,
            comments: true,
          },
        },
      },
    });

    // Create notification if it's a comment
    if (parentId) {
      const parentPost = await prisma.post.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });

      // Create notification for parent post author (if not commenting on own post)
      if (parentPost && parentPost.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: "COMMENT",
            actorId: session.user.id,
            recipientId: parentPost.authorId,
            postId: parentId,
          },
        });

        // Trigger Pusher notification event
        try {
          const { pusherServer } = await import("@/lib/pusher");
          await pusherServer.trigger(`user-${parentPost.authorId}`, "new-notification", {
            type: "COMMENT",
            actorId: session.user.id,
          });
        } catch (error) {
          console.error("Pusher notification error:", error);
        }
      }

      // Trigger Pusher event for comment count update
      try {
        const { pusherServer } = await import("@/lib/pusher");
        await pusherServer.trigger(`post-${parentId}`, "comment-added", {
          postId: post.id,
        });
      } catch (error) {
        console.error("Pusher error:", error);
      }
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






