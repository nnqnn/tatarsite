import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import type { ThreadedComment } from "@/lib/api/types";

interface CommentsDialogProps {
  open: boolean;
  placeTitle: string;
  comments: ThreadedComment[];
  loading: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onLoad: () => Promise<void>;
  onSubmit: (body: string, parentCommentId?: string) => Promise<void>;
}

export default function CommentsDialog({
  open,
  placeTitle,
  comments,
  loading,
  error = null,
  onOpenChange,
  onLoad,
  onSubmit,
}: CommentsDialogProps) {
  const [commentText, setCommentText] = useState("");
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    onLoad();
  }, [open, onLoad]);

  const submitRootComment = async () => {
    if (!commentText.trim()) return;
    await onSubmit(commentText.trim());
    setCommentText("");
  };

  const submitReply = async (commentId: string) => {
    const value = replyMap[commentId]?.trim();
    if (!value) return;

    await onSubmit(value, commentId);

    setReplyMap((prev) => ({
      ...prev,
      [commentId]: "",
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Комментарии: {placeTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Напишите комментарий"
            />
            <Button onClick={submitRootComment} disabled={loading || !commentText.trim()}>
              Отправить
            </Button>
          </div>

          {loading ? <p className="text-sm text-muted-foreground">Загружаем комментарии...</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="space-y-4">
            {comments.length === 0 ? <p className="text-sm text-muted-foreground">Комментариев пока нет</p> : null}

            {comments.map((comment) => (
              <div key={comment.id} className="rounded-md border p-3 space-y-3">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{comment.author.name}</p>
                    <p className="text-sm text-muted-foreground">{comment.body}</p>
                  </div>
                </div>

                <div className="pl-10 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="rounded-md bg-muted/50 p-2">
                      <p className="text-xs font-medium">{reply.author.name}</p>
                      <p className="text-xs text-muted-foreground">{reply.body}</p>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      value={replyMap[comment.id] ?? ""}
                      onChange={(event) =>
                        setReplyMap((prev) => ({
                          ...prev,
                          [comment.id]: event.target.value,
                        }))
                      }
                      placeholder="Ответить"
                    />
                    <Button
                      variant="outline"
                      onClick={() => submitReply(comment.id)}
                      disabled={loading || !(replyMap[comment.id] ?? "").trim()}
                    >
                      Ответить
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
