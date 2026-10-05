import { NextResponse } from "next/server";
import { migrateDepartmentHeadToYouthForum } from "@/lib/migrate-sections";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await migrateDepartmentHeadToYouthForum();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
