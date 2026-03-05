"use client";

// ==============================================================================
// Roles & Permissions Client Component
// ==============================================================================
// Displays roles in card format with their permissions grouped by resource.
// System roles (super_admin, tenant_admin, user) are read-only.
// Custom roles can be created/edited in future phases.
// ==============================================================================

import React, { useEffect, useState } from "react";
import { Badge, Spinner, Accordion } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { getAvailableRoles } from "@/app/actions/user";

const RolesClient = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const result = await getAvailableRoles();
        setRoles(result);
      } catch (err: any) {
        setError(err.message || "Failed to load roles");
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  if (loading) {
    return (
      <CardBox>
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-500">Loading roles...</span>
        </div>
      </CardBox>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
        <Icon icon="solar:danger-triangle-line-duotone" className="inline mr-2" height={16} />
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => (
        <CardBox key={role.id} className="relative">
          {/* System badge */}
          {role.is_system && (
            <Badge color="warning" className="absolute top-4 right-4" size="xs">
              System
            </Badge>
          )}

          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon
                icon={
                  role.role_code === "super_admin"
                    ? "solar:shield-star-line-duotone"
                    : role.role_code === "tenant_admin"
                    ? "solar:shield-user-line-duotone"
                    : "solar:user-line-duotone"
                }
                height={24}
                className="text-primary"
              />
            </div>
            <div>
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                {role.role_name}
              </h5>
              <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {role.role_code}
              </code>
            </div>
          </div>

          {role.description && (
            <p className="text-sm text-gray-500 mb-4">{role.description}</p>
          )}

          {/* Role capabilities overview */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h6 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Capabilities
            </h6>
            {role.role_code === "super_admin" ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Icon icon="solar:verified-check-bold" height={16} />
                <span>Full platform access — all resources, all actions</span>
              </div>
            ) : role.role_code === "tenant_admin" ? (
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-line-duotone" height={14} className="text-green-500" />
                  Manage users within organization
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-line-duotone" height={14} className="text-green-500" />
                  Configure tenant settings
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-line-duotone" height={14} className="text-green-500" />
                  View audit trail
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-line-duotone" height={14} className="text-green-500" />
                  Access all module data
                </li>
              </ul>
            ) : (
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-line-duotone" height={14} className="text-green-500" />
                  Access assigned modules
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-line-duotone" height={14} className="text-green-500" />
                  View own data
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="solar:close-circle-line-duotone" height={14} className="text-red-400" />
                  Cannot manage other users
                </li>
              </ul>
            )}
          </div>
        </CardBox>
      ))}

      {roles.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          <Icon icon="solar:shield-line-duotone" height={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg">No roles configured</p>
          <p className="text-sm">Run the seed command to create default roles.</p>
        </div>
      )}
    </div>
  );
};

export default RolesClient;
