import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if already reposted
    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: id,
        },
      },
    });

    if (existingRepost) {
      return NextResponse.json({ error: "Already reposted" }, { status: 400 });
    }

    await prisma.repost.create({
      data: {
        userId: session.user.id,
        postId: id,
      },
    });

    // Get post author to create notification
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    // Create notification for post author (if not reposting own post)
    if (post && post.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "REPOST",
          actorId: session.user.id,
          recipientId: post.authorId,
          postId: id,
        },
      });

      // Trigger Pusher notification event
      try {
        const { pusherServer } = await import("@/lib/pusher");
        await pusherServer.trigger(`user-${post.authorId}`, "new-notification", {
          type: "REPOST",
          actorId: session.user.id,
        });
      } catch (error) {
        console.error("Pusher notification error:", error);
      }
    }

    // Trigger Pusher event for post update
    try {
      const { pusherServer } = await import("@/lib/pusher");
      await pusherServer.trigger(`post-${id}`, "repost-added", {
        userId: session.user.id,
      });
    } catch (error) {
      console.error("Pusher error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reposting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.repost.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unreposting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
