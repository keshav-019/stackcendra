"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RealGitTree } from '@/components/modes/RealGitTree';
import { formatProjectDate, providerIcon, providerLabel } from '@/components/projects/provider-meta';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Project } from '@/lib/project-schema';
import { PROJECT_NAME_MAX } from '@/lib/project-schema';
import { FolderOpen, Loader2, Pencil, Trash2 } from 'lucide-react';

async function readError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return typeof data?.error === 'string' ? data.error : fallback;
}

export const ProjectDetail: React.FC<{ project: Project }> = ({ project: initial }) => {
  const router = useRouter();
  const [project, setProject] = useState(initial);

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [localPath, setLocalPath] = useState(project.localPath);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const Icon = providerIcon[project.provider];

  const openEdit = (open: boolean) => {
    if (open) {
      setName(project.name);
      setDescription(project.description);
      setLocalPath(project.localPath);
      setEditError(null);
    }
    setEditOpen(open);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, localPath }),
      });
      if (!res.ok) throw new Error(await readError(res, 'Failed to save changes'));
      const data = await res.json();
      setProject(data.project);
      setEditOpen(false);
      router.refresh();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await readError(res, 'Failed to delete project'));
      router.push('/projects');
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete project');
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-white break-words">{project.name}</h1>
            <Badge variant="outline" className="border-white/20 text-gray-300 flex items-center gap-1">
              <Icon size={12} />
              {providerLabel[project.provider]}
            </Badge>
          </div>
          {project.description && <p className="text-sm text-gray-400 whitespace-pre-line">{project.description}</p>}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Dialog open={editOpen} onOpenChange={openEdit}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10">
                <Pencil size={14} className="mr-1.5" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
              <form onSubmit={save} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Edit project</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    The linked repository can&apos;t be changed; delete and re-add the project to link a different one.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-gray-300">Project name</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    maxLength={PROJECT_NAME_MAX}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-path" className="text-gray-300">Local path</Label>
                  <Input
                    id="edit-path"
                    value={localPath}
                    onChange={(e) => setLocalPath(e.target.value)}
                    className="bg-white/5 border-white/10 text-white font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                {editError && <p role="alert" className="text-sm text-red-400">{editError}</p>}
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={saving || !name.trim() || !localPath.trim()}
                    className="bg-gradient-ai hover:opacity-90"
                  >
                    {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-500/30 text-red-300 bg-transparent hover:bg-red-500/10">
                <Trash2 size={14} className="mr-1.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This removes the project from StackCendra. Nothing on disk or on{' '}
                  {project.provider === 'none' ? 'your Git host' : providerLabel[project.provider]} is touched.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteError && <p role="alert" className="text-sm text-red-400">{deleteError}</p>}
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(event) => {
                    event.preventDefault();
                    remove();
                  }}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting && <Loader2 size={14} className="mr-1.5 animate-spin" />}
                  Delete project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="bg-black/20 border-white/10 p-5 mb-4">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="min-w-0">
            <dt className="text-gray-500 text-xs mb-1">Local path</dt>
            <dd className="text-white font-mono text-xs break-all">{project.localPath}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-gray-500 text-xs mb-1">Repository</dt>
            <dd className="text-white break-all">
              {project.repoFullName ?? '—'}
              {project.defaultBranch && <span className="text-gray-500"> · {project.defaultBranch}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs mb-1">Added</dt>
            <dd className="text-white">{formatProjectDate(project.createdAt)}</dd>
          </div>
        </dl>
      </Card>

      {project.provider === 'none' || !project.repoFullName ? (
        <Card className="bg-black/20 border-white/10 p-6 flex items-start gap-3">
          <FolderOpen size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-md font-semibold text-white mb-1">Local-only project</h2>
            <p className="text-sm text-gray-400">
              Git status and environment discovery for local paths come from the desktop agent, which isn&apos;t
              available yet. Add a project linked to GitHub or GitLab to see live branches, pull requests and CI/CD runs.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="bg-black/20 border-white/10 p-5">
          <RealGitTree provider={project.provider} repo={project.repoFullName} />
        </Card>
      )}
    </>
  );
};
