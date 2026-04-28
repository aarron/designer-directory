import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ApproveButton } from "./ApproveButton";

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token !== process.env.ADMIN_SECRET) redirect("/admin/login");
}

export default async function SuccessStoriesAdminPage() {
  await checkAuth();

  const stories = await db.successStory.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = stories.filter((s) => !s.approved);
  const approved = stories.filter((s) => s.approved);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-display-sm font-bold text-brand-black">
            Success Stories
          </h1>
          <p className="text-brand-gray-500 text-sm mt-1">
            {pending.length} pending review · {approved.length} approved
          </p>
        </div>
        <Link href="/admin" className="text-sm text-brand-gray-500 hover:text-brand-black transition-colors">
          ← Back to admin
        </Link>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <section className="mb-12">
          <h2 className="font-semibold text-brand-black mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            Pending review
          </h2>
          <div className="flex flex-col gap-4">
            {pending.map((story) => (
              <div
                key={story.id}
                className="bg-white border border-brand-gray-100 rounded-xl p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-brand-black">{story.designerName}</p>
                    <p className="text-sm text-brand-gray-500">
                      {story.newRole ? `${story.newRole}${story.company ? ` at ${story.company}` : ""}` : story.company || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${story.public ? "bg-green-50 text-green-700" : "bg-brand-gray-100 text-brand-gray-500"}`}>
                      {story.public ? "Public" : "Private"}
                    </span>
                    <span className="text-xs text-brand-gray-400">{formatDate(story.createdAt)}</span>
                  </div>
                </div>
                <blockquote className="text-brand-gray-700 text-sm leading-relaxed border-l-2 border-brand-gray-200 pl-4 mb-4 italic">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>
                <div className="flex gap-3">
                  <ApproveButton storyId={story.id} approved={false} />
                  <Link
                    href={`/talent/${story.designerId}`}
                    target="_blank"
                    className="text-sm text-brand-gray-500 hover:text-brand-black transition-colors"
                  >
                    View profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pending.length === 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-12 text-center">
          <p className="text-green-700 font-medium">All caught up — no stories pending review.</p>
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <section>
          <h2 className="font-semibold text-brand-black mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Approved ({approved.length})
          </h2>
          <div className="flex flex-col gap-3">
            {approved.map((story) => (
              <div
                key={story.id}
                className="bg-white border border-brand-gray-100 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-semibold text-brand-black text-sm">{story.designerName}</p>
                    <p className="text-xs text-brand-gray-500">
                      {story.newRole ? `${story.newRole}${story.company ? ` at ${story.company}` : ""}` : story.company || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${story.public ? "bg-green-50 text-green-700" : "bg-brand-gray-100 text-brand-gray-500"}`}>
                      {story.public ? "Public" : "Private"}
                    </span>
                    <ApproveButton storyId={story.id} approved={true} />
                  </div>
                </div>
                <blockquote className="text-brand-gray-600 text-sm leading-relaxed border-l-2 border-brand-gray-200 pl-3 italic">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>
              </div>
            ))}
          </div>
        </section>
      )}

      {stories.length === 0 && (
        <div className="text-center py-20 text-brand-gray-400">
          <p className="text-lg font-medium">No success stories yet.</p>
          <p className="text-sm mt-2">They&apos;ll appear here when designers submit them after switching to &ldquo;Not looking.&rdquo;</p>
        </div>
      )}
    </div>
  );
}
