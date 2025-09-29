"use client";

import { TreeNode } from "@/entities/tree-node/model/tree-node.type";
import styles from "./tree-editor.view.module.css";
import { useEffect, useState } from "react";
import { TreeNodeService } from "@/entities/tree-node/api/tree-node.service";
import DBTree from "@/widgets/db-tree/ui/db-tree";
import CacheTree from "@/widgets/cached-tree/ui/cache-tree";
import { CacheTreeNode } from "@/widgets/cached-tree/model/cache-tree-node.type";

export default function TreeEditorView() {
  const [selectedDbTreeNode, setSelectedDbTreeNode] = useState<TreeNode | null>(null);
  const [selectedCachedTreeNode, setSelectedCachedTreeNode] = useState<CacheTreeNode | null>(null);

  const [allNodes, setAllNodes] = useState<TreeNode[]>([]);
  const [cachedNodes, setCachedNodes] = useState<CacheTreeNode[]>([]);

  useEffect(() => {
    refreshDbTree();
  }, []);

  function refreshDbTree() {
    TreeNodeService.getAll().then((res) => {
      setAllNodes(res.data);
    });
  }

  function setChachedNodesAndSelectedCachedTreeNode(nodes: CacheTreeNode[]) {
    setCachedNodes(nodes);
    if (selectedCachedTreeNode) {
      const found = nodes.find((n) => n.id === selectedCachedTreeNode.id);
      setSelectedCachedTreeNode(found || null);
    }
  }

  function isParentDeleted(node: TreeNode): boolean {
    const found = cachedNodes.find((n) => n.id === node.parentid);
    return found?.deleted || found?.state === "deleted" || false;
  }

  function deleteChild(node: TreeNode) {
    function getAllChildNodesRecursive(id: string): CacheTreeNode[] {
      const res: CacheTreeNode[] = [];
      for (let i = 0; i < cachedNodes.length; i++) {
        if (cachedNodes[i].parentid === id) {
          res.push(cachedNodes[i]);
          const childNodes = getAllChildNodesRecursive(cachedNodes[i].id);
          res.push(...childNodes);
        }
      }
      return res;
    }
    const childNodes = getAllChildNodesRecursive(node.id);
    childNodes.forEach((n) => {
      if (!n.deleted && n.state !== "deleted") n.state = "deleted";
    });
  }

  function getNodeClick() {
    if (!selectedDbTreeNode) return;
    TreeNodeService.getOne(selectedDbTreeNode.id)
      .then((res) => {
        const found = cachedNodes.find((n) => n.id === res.id);
        if (found) {
          alert("Already has this node");
          return;
        }
        let state = "old";
        if (isParentDeleted(res)) {
          state = "deleted";
          deleteChild(res);
        }
        setChachedNodesAndSelectedCachedTreeNode([...cachedNodes, { ...res, state: state === "deleted" ? "deleted" : "old" }]);
      })
      .catch((e) => {
        alert("Error on getting node: " + e.message);
      });
  }

  function addClick() {
    const newValue = prompt("Enter new value");
    if (!newValue) return;
    const newNode: CacheTreeNode = {
      id: Math.random().toString(36).substring(2, 9),
      parentid: selectedCachedTreeNode ? selectedCachedTreeNode.id : null,
      value: newValue,
      deleted: false,
      state: "new",
    };
    setChachedNodesAndSelectedCachedTreeNode([...cachedNodes, newNode]);
  }

  function deleteClick() {
    function deleteChildren(id: string) {
      cachedNodes.forEach((n) => {
        if (n.parentid === id && !n.deleted && n.state != "deleted") {
          n.state = "deleted";
          deleteChildren(n.id);
        }
      });
    }

    if (!selectedCachedTreeNode || selectedCachedTreeNode.deleted || selectedCachedTreeNode.state === "deleted") return;
    deleteChildren(selectedCachedTreeNode.id);
    setChachedNodesAndSelectedCachedTreeNode(cachedNodes.map((n) => (n.id === selectedCachedTreeNode.id ? { ...n, state: "deleted" } : n)));
  }

  function resetClick() {
    TreeNodeService.reset().then((res) => {
      setAllNodes(res.data);
      setCachedNodes([]);
      setSelectedCachedTreeNode(null);
    });
  }

  function editClick() {
    if (!selectedCachedTreeNode || selectedCachedTreeNode.deleted || selectedCachedTreeNode.state === "deleted") return;
    const newValue = prompt("Enter new value", selectedCachedTreeNode.value);
    if (!newValue) return;
    let state = selectedCachedTreeNode.state;
    if (state !== "new") state = "edited";
    setChachedNodesAndSelectedCachedTreeNode([
      ...cachedNodes.map((n) => (n.id === selectedCachedTreeNode.id ? { ...n, value: newValue, state } : n)),
    ]);
  }

  function saveCacheRemove() {
    function deleteChildren(id: string) {
      cachedNodes.forEach((n) => {
        if (n.parentid === id && !n.deleted) {
          n.deleted = true;
          deleteChildren(n.id);
        }
      });
    }
    cachedNodes.forEach((n) => {
      if (!n.deleted && n.state === "deleted") {
        deleteChildren(n.id);
        n.deleted = true;
      }
    });
  }
  function saveCacheNew() {
    // Ничего делать не нужно
  }
  function saveCacheRename() {
    // Ничего делать не нужно
  }

  function saveCache() {
    saveCacheRemove();
    saveCacheNew();
    saveCacheRename();
    setChachedNodesAndSelectedCachedTreeNode(cachedNodes.map((n) => ({ ...n, state: "old" })));
  }

  function saveClick() {
    const data = {
      new: [] as { id: string; parentid: string | null; value: string }[],
      rename: [] as { id: string; value: string }[],
      delete: [] as { id: string }[],
    };

    cachedNodes.forEach((n) => {
      if (n.state === "deleted") data.delete.push({ id: n.id });
      else if (n.state === "new") data.new.push({ id: n.id, parentid: n.parentid, value: n.value });
      else if (n.state === "edited") data.rename.push({ id: n.id, value: n.value });
    });

    TreeNodeService.apply(data)
      .then((res) => {
        refreshDbTree();
        // Отмечаем удаленные ноды из ответа от сервера
        res.deleted.forEach((n) => {
          const cachedNode = cachedNodes.find((cn) => cn.id === n.id);
          if (cachedNode) {
            cachedNode.deleted = true;
            cachedNode.state === "old";
          }
        });
        saveCache();
        alert("Changes saved");
      })
      .catch((e) => {
        alert("Error on saving changes: " + e.message);
      });
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.tree}>
          <h3>Cached Tree</h3>
          <CacheTree nodes={cachedNodes} onNodeSelect={(node) => setSelectedCachedTreeNode(node)} />
        </div>
        <div className={styles.get_node}>
          <button disabled={!selectedDbTreeNode} onClick={getNodeClick}>
            {"<<<<"}
          </button>
        </div>
        <div className={styles.tree}>
          <h3>DB Tree</h3>
          <DBTree nodes={allNodes} onNodeSelect={(node) => setSelectedDbTreeNode(node)} />
        </div>
      </div>
      <div className={styles.toolbar}>
        <button
          disabled={!selectedCachedTreeNode || selectedCachedTreeNode.deleted || selectedCachedTreeNode.state === "deleted"}
          onClick={addClick}>
          Add
        </button>
        <button
          disabled={!selectedCachedTreeNode || selectedCachedTreeNode.deleted || selectedCachedTreeNode.state === "deleted"}
          onClick={editClick}>
          Edit
        </button>
        <button
          disabled={!selectedCachedTreeNode || selectedCachedTreeNode.deleted || selectedCachedTreeNode.state === "deleted"}
          onClick={deleteClick}>
          Delete
        </button>
        <button onClick={saveClick}>Save</button>
        <button onClick={resetClick}>Reset</button>
      </div>
    </>
  );
}

