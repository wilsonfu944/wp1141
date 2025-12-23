import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        id: true,
        name: true,
        userId: true,
        email: true,
        image: true,
        bio: true,
        backgroundImage: true,
        joinedAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's posts and reposts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: user.id, parentId: null },
          {
            reposts: {
              some: { userId: user.id },
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

    const postsWithFlags = posts.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      isReposted: post.reposts.length > 0,
      likes: undefined,
      reposts: undefined,
    }));

    // Check if current user follows this profile
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id,
        },
      },
    });

    // Get liked posts if viewing own profile
    let likedPosts: any[] = [];
    if (session.user.userId === userId) {
      const likes = await prisma.like.findMany({
        where: { userId: user.id },
        include: {
          post: {
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
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      likedPosts = likes.map((like) => ({
        ...like.post,
        isLiked: like.post.likes.length > 0,
        isReposted: like.post.reposts.length > 0,
        likes: undefined,
        reposts: undefined,
      }));
    }

    return NextResponse.json({
      user,
      posts: postsWithFlags,
      likedPosts,
      isFollowing: !!isFollowing,
      followersCount: user._count.followers,
      followingCount: user._count.following,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    if (session.user.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, bio, backgroundImage } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        name: name || undefined,
        bio: bio || undefined,
        backgroundImage: backgroundImage || undefined,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




