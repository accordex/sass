"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Alert, Select, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { getCertificates, revokeCertificate, getCourses } from "@/app/actions/elearning";

interface Certificate {
  id: string;
  certificate_no: string;
  recipient_name: string;
  status: string;
  issued_at: string;
  expires_at: string | null;
  pdf_url: string | null;
  user?: { id: string; first_name: string; last_name: string; email: string };
  course?: { id: string; title: string };
}

interface CourseOption { id: string; title: string; }

const CertificatesClient = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [revokeModal, setRevokeModal] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    const [certRes, courseRes] = await Promise.all([
      getCertificates({ page, perPage: 15, search, course_id: filterCourse || undefined }),
      getCourses({ perPage: 200 }),
    ]);
    if ("error" in certRes) { setError(certRes.error as string); }
    else {
      setCertificates((certRes as any).certificates || []);
      setTotal((certRes as any).total || 0);
      setTotalPages((certRes as any).totalPages || 1);
    }
    if (!("error" in courseRes)) setCourses(((courseRes as any).courses || []).map((c: any) => ({ id: c.id, title: c.title })));
    setLoading(false);
  }, [search, page, filterCourse]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRevoke = async () => {
    if (!revokeModal) return;
    setRevoking(true);
    const result = await revokeCertificate(revokeModal);
    if ("error" in result) setError(result.error as string);
    else { setSuccess("Certificate revoked"); setRevokeModal(null); fetchData(); }
    setRevoking(false);
  };

  const statusColors: Record<string, string> = { ISSUED: "success", REVOKED: "failure", EXPIRED: "gray" };

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-gray-800 p-6">
      {error && <Alert color="failure" className="mb-4" onDismiss={() => setError("")}>{error}</Alert>}
      {success && <Alert color="success" className="mb-4" onDismiss={() => setSuccess("")}>{success}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <TextInput icon={() => <Icon icon="solar:magnifer-line-duotone" className="text-lg" />}
            placeholder="Search certificates..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
          <Select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setPage(1); }}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
          <span className="text-sm text-gray-500">{total} certificate(s)</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="xl" /></div>
      ) : certificates.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No certificates found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead>
                <TableHeadCell>Certificate #</TableHeadCell>
                <TableHeadCell>Recipient</TableHeadCell>
                <TableHeadCell>Course</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Issued</TableHeadCell>
                <TableHeadCell>Expires</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {certificates.map(cert => (
                  <TableRow key={cert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-mono text-sm">{cert.certificate_no}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{cert.recipient_name}</span>
                        <p className="text-xs text-gray-400">{cert.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{cert.course?.title}</TableCell>
                    <TableCell><Badge color={statusColors[cert.status] || "info"}>{cert.status}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(cert.issued_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell>
                      {cert.status === "ISSUED" && (
                        <Button size="xs" color="failure" onClick={() => setRevokeModal(cert.id)}>
                          <Icon icon="solar:close-circle-line-duotone" className="mr-1" />Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Revoke Confirmation Modal */}
      <Modal show={!!revokeModal} onClose={() => setRevokeModal(null)} size="md">
        <ModalHeader>Revoke Certificate</ModalHeader>
        <ModalBody><p>Are you sure you want to revoke this certificate? This action will mark it as revoked.</p></ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleRevoke} disabled={revoking}>
            {revoking ? <Spinner size="sm" className="mr-2" /> : null}Revoke
          </Button>
          <Button color="gray" onClick={() => setRevokeModal(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CertificatesClient;
