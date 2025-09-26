import Tree from "@/shared/ui/tree/tree";
import { CacheTreeNode } from "../model/cache-tree-node.type";

export interface CacheTreeProps {
  nodes: CacheTreeNode[];
  onNodeSelect?: (node: CacheTreeNode) => void;
}

export default function CacheTree({ nodes, onNodeSelect }: CacheTreeProps) {
  const cachedNodes = getCacheNodes();

  function getCacheNodes() {
    const res = nodes.map((n) => {
      const parent = nodes.find((node) => node.id === n.parentid);
      return { ...n, parentid: parent ? n.parentid : null, deleted: n.deleted || n.state === "deleted" };
    });
    return res;
  }

  return <Tree datas={cachedNodes} parentid={null} onNodeSelect={onNodeSelect} />;
}
