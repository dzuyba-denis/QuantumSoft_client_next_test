import cn from "classnames";
import styles from "./node.module.css";
import { TreeNode } from "./node.type";

interface NodeProps<T extends TreeNode> {
  node: T; // Данные ноды
  nodes: T[]; // Весь массив данных переданный в дерево
  selected?: T;
  setSelected: (data: T) => void;
}

export default function Node<T extends TreeNode>({ node, nodes, selected, setSelected }: NodeProps<T>) {
  const child = nodes.filter((item) => item.parentid === node.id);

  function onNodeClick(e: React.MouseEvent<HTMLLIElement>) {
    e.preventDefault();
    e.stopPropagation();
    setSelected(node);
  }
  return (
    <li className={styles.li} onClick={onNodeClick}>
      <span className={cn(styles.node, selected?.id === node.id && styles.selected, node.deleted && styles.deleted)}>{node.value}</span>
      <ul className={styles.ul}>
        {child.map((item) => (
          <Node key={item.id} node={item} nodes={nodes} selected={selected} setSelected={setSelected} />
        ))}
      </ul>
    </li>
  );
}
