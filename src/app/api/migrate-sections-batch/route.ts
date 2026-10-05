import { NextResponse } from "next/server";
import { migrateAllSections } from "@/lib/migrate-sections-batch";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const results = await migrateAllSections();
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
