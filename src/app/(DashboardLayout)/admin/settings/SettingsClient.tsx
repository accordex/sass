"use client";

// ==============================================================================
// Settings Client Component
// ==============================================================================
// Displays settings grouped by category with inline editing.
// Supports different value types (string, boolean, number, JSON).
// ==============================================================================

import React, { useEffect, useState, useTransition } from "react";
import {
  Badge,
  Button,
  TextInput,
  Select,
  Spinner,
  Tabs,
  ToggleSwitch,
  Label,
} from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getSettings, updateSetting } from "@/app/actions/settings";

type SettingScope = "platform" | "tenant" | "user";

const SettingsClient = () => {
  const [activeScope, setActiveScope] = useState<SettingScope>("tenant");
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  // Editable values tracked by setting ID
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  // ----- Fetch settings by scope -----
  const fetchSettings = async (scope: SettingScope) => {
    setLoading(true);
    setError("");
    try {
      const result = await getSettings({ scope });
      setSettings(result);
      // Initialize edit values
      const values: Record<string, any> = {};
      result.forEach((s: any) => {
        values[s.id] = s.setting_value;
      });
      setEditValues(values);
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings(activeScope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScope]);

  // ----- Save a single setting -----
  const handleSave = (setting: any) => {
    setSuccessMsg("");
    startTransition(async () => {
      try {
        await updateSetting({
          setting_key: setting.setting_key,
          setting_value: editValues[setting.id],
          category: setting.category,
          value_type: setting.value_type,
          module: setting.module,
          scope: activeScope,
        });
        setSuccessMsg(`"${setting.setting_key}" updated successfully.`);
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  // Group settings by category for display
  const grouped = settings.reduce((acc: Record<string, any[]>, setting) => {
    const cat = setting.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(setting);
    return acc;
  }, {});

  return (
    <>
      {/* Scope Tabs */}
      <CardBox className="mb-6">
        <div className="flex gap-3">
          {(["tenant", "platform", "user"] as SettingScope[]).map((scope) => (
            <Button
              key={scope}
              size="sm"
              color={activeScope === scope ? "info" : "light"}
              onClick={() => setActiveScope(scope)}
            >
              <Icon
                icon={
                  scope === "platform"
                    ? "solar:server-line-duotone"
                    : scope === "tenant"
                    ? "solar:buildings-line-duotone"
                    : "solar:user-line-duotone"
                }
                height={16}
                className="mr-2"
              />
              {scope.charAt(0).toUpperCase() + scope.slice(1)} Settings
            </Button>
          ))}
        </div>
      </CardBox>

      {/* Success Message */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
          <Icon icon="solar:check-circle-line-duotone" className="inline mr-2" height={16} />
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <Icon icon="solar:danger-triangle-line-duotone" className="inline mr-2" height={16} />
          {error}
        </div>
      )}

      {/* Settings Display */}
      {loading ? (
        <CardBox>
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-500">Loading settings...</span>
          </div>
        </CardBox>
      ) : settings.length === 0 ? (
        <CardBox>
          <div className="text-center py-12 text-gray-500">
            <Icon icon="solar:settings-minimalistic-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg">No settings configured</p>
            <p className="text-sm">
              Settings will be populated as modules are configured.
              Run the seed command to create default platform settings.
            </p>
          </div>
        </CardBox>
      ) : (
        Object.entries(grouped).map(([category, categorySettings]) => (
          <CardBox key={category} className="mb-6">
            <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon icon="solar:folder-line-duotone" height={20} className="text-primary" />
              {category}
              <Badge color="info" size="xs">{(categorySettings as any[]).length}</Badge>
            </h5>

            <div className="space-y-4">
              {(categorySettings as any[]).map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  {/* Setting key & description */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {setting.setting_key}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Type: {setting.value_type} | Module: {setting.module || "Global"}
                    </div>
                  </div>

                  {/* Value Editor */}
                  <div className="w-64">
                    {setting.value_type === "BOOLEAN" ? (
                      <ToggleSwitch
                        checked={editValues[setting.id] === true || editValues[setting.id] === "true"}
                        onChange={(checked) =>
                          setEditValues((p) => ({ ...p, [setting.id]: checked }))
                        }
                        label=""
                      />
                    ) : setting.value_type === "NUMBER" ? (
                      <TextInput
                        type="number"
                        sizing="sm"
                        value={editValues[setting.id] ?? ""}
                        onChange={(e) =>
                          setEditValues((p) => ({ ...p, [setting.id]: Number(e.target.value) }))
                        }
                      />
                    ) : (
                      <TextInput
                        sizing="sm"
                        value={
                          typeof editValues[setting.id] === "object"
                            ? JSON.stringify(editValues[setting.id])
                            : editValues[setting.id] ?? ""
                        }
                        onChange={(e) =>
                          setEditValues((p) => ({ ...p, [setting.id]: e.target.value }))
                        }
                      />
                    )}
                  </div>

                  {/* Save Button */}
                  <Button
                    size="xs"
                    color="info"
                    disabled={isPending}
                    onClick={() => handleSave(setting)}
                  >
                    {isPending ? <Spinner size="xs" /> : <Icon icon="solar:diskette-line-duotone" height={14} />}
                  </Button>
                </div>
              ))}
            </div>
          </CardBox>
        ))
      )}
    </>
  );
};

export default SettingsClient;
