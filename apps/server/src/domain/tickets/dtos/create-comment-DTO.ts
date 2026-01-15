import z from "zod";

const createCommentDTO = z.object({
  ticketId: z.string().uuid(),
  authorId: z.string().uuid(),
  message: z.string().min(1).max(255),
});

export type CreateCommentDTO = z.infer<typeof createCommentDTO>;