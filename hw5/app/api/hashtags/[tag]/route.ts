import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tag } = await params;
    const hashtag = `#${tag}`;

    // Find posts containing this hashtag
    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: hashtag,
          mode: "insensitive",
        },
        parentId: null, // Only top-level posts
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

    return NextResponse.json({ posts: postsWithFlags, tag });
  } catch (error) {
    console.error("Error fetching hashtag posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

