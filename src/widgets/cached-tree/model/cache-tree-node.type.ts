import { TreeNode } from "@/entities/tree-node/model/tree-node.type";

export type CacheTreeNode = TreeNode & { state: "new" | "edited" | "deleted" | "old" };
