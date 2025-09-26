import { TreeNode } from "@/entities/tree-node/model/tree-node.type";
import Tree from "@/shared/ui/tree/tree";

export interface DBTreeProps {
  nodes: TreeNode[];
  onNodeSelect?: (data: TreeNode) => void;
}

export default function DBTree({ nodes, onNodeSelect }: DBTreeProps) {
  return <Tree datas={nodes} parentid={null} onNodeSelect={onNodeSelect} />;
}
