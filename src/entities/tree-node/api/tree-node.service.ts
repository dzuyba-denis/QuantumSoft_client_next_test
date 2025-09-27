import config from "@/shared/config";
import { TreeNode } from "../model/tree-node.type";

export class TreeNodeService {
  static async getAll(): Promise<{ data: TreeNode[] }> {
    return fetch(config.API_URL + "/tree-nodes").then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  }
  static async getOne(id: string): Promise<TreeNode> {
    return fetch(config.API_URL + "/tree-nodes/" + id).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  }
  static async apply(data: {
    rename?: { id: string; value: string }[];
    delete?: { id: string }[];
  }): Promise<{ ok: boolean; deleted: { id: string }[] }> {
    return fetch(config.API_URL + "/tree-nodes/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  }

  static async reset(): Promise<{ data: TreeNode[] }> {
    return fetch(config.API_URL + "/tree-nodes/reset").then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  }
}
