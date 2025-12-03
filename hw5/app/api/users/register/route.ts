import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateUserId } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!validateUserId(userId)) {
      return NextResponse.json(
        { error: "Invalid userID format" },
        { status: 400 }
      );
    }

    // Check if userId already exists
    const existingUser = await prisma.user.findUnique({
      where: { userId: userId.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "UserID already taken" },
        { status: 400 }
      );
    }

    // Update user with new userId
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { userId: userId.toLowerCase() },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






