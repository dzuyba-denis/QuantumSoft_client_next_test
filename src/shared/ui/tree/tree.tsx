import { useState } from "react";

import Node from "./node";
import styles from "./tree.module.css";
import { TreeNode } from "./node.type";

export interface TreeProps<T extends TreeNode> {
  datas: T[];
  parentid: string | null;
  onNodeSelect?: (data: T) => void;
}

export default function Tree<T extends TreeNode>({ datas, parentid, onNodeSelect }: TreeProps<T>) {
  const [selected, setSelected] = useState<T>();
  const nodes = datas.filter((item) => item.parentid === parentid);
  const handleSetSelected = (data: T) => {
    setSelected(data);
    if (onNodeSelect) onNodeSelect(data);
  };

  return (
    <ul className={styles.ul}>
      {nodes.map((item) => (
        <Node key={item.id} node={item} nodes={datas} selected={selected} setSelected={handleSetSelected} />
      ))}
    </ul>
  );
}
