import { STYLE_PRESET_DESCRIPTIONS } from "@/lib/constants";
import type { AppNode, SettingNodeData, StyleNodeData } from "@/lib/types";

export function getStyleDescription(opts: { nodes: AppNode[] }): string {
  const styleNode = opts.nodes.find((n) => n.type === "style");
  const styleData = styleNode?.data as StyleNodeData | undefined;

  if (!styleData) {
    return "";
  }

  if (styleData.preset === "custom") {
    return styleData.customDescription;
  }

  return (
    STYLE_PRESET_DESCRIPTIONS[
      styleData.preset as Exclude<typeof styleData.preset, "custom">
    ] ?? ""
  );
}

export function getSettingDescription(opts: { nodes: AppNode[] }): string {
  const settingNode = opts.nodes.find((n) => n.type === "setting");
  const settingData = settingNode?.data as SettingNodeData | undefined;
  return settingData?.description ?? "";
}
