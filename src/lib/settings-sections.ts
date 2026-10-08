/**
 * 设置页「段」的地址栏约定，与 NyaGallery 的 /admin?section=accounts 保持同一套规则：
 *
 *   /settings                   默认段（providers），不带参数
 *   /settings?section=services  其余段
 */
export type SettingsSection = "providers" | "rules" | "services" | "privacy" | "data";

export const SETTINGS_SECTION_PATH = "/settings";

export const DEFAULT_SETTINGS_SECTION: SettingsSection = "providers";

export const SETTINGS_SECTIONS: Array<{ id: SettingsSection; label: string }> = [
  { id: "providers", label: "公共服务" },
  { id: "rules", label: "规则目录" },
  { id: "services", label: "扩展服务" },
  { id: "privacy", label: "隐私与转换" },
  { id: "data", label: "本地数据" },
];

export function isSettingsSection(value: string | null | undefined): value is SettingsSection {
  return Boolean(value && SETTINGS_SECTIONS.some((section) => section.id === value));
}

/** 缺失或非法的 ?section= 一律回落到默认段。 */
export function normalizeSettingsSection(value: string | null | undefined): SettingsSection {
  return isSettingsSection(value) ? value : DEFAULT_SETTINGS_SECTION;
}

export function getSettingsSectionHref(section: SettingsSection): string {
  return section === DEFAULT_SETTINGS_SECTION
    ? SETTINGS_SECTION_PATH
    : `${SETTINGS_SECTION_PATH}?section=${section}`;
}

export function getSettingsSectionElementId(section: SettingsSection): string {
  return `settings-section-${section}`;
}
