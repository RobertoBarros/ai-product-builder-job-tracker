"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApplicationForm } from "@/components/application-form";
import { updateApplication } from "@/app/(tracker)/applications/actions";
import type { Application } from "@/lib/types";

export function EditApplicationDialog({ application }: { application: Application }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit application</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit application</DialogTitle>
        </DialogHeader>
        <ApplicationForm
          action={updateApplication}
          application={application}
          submitLabel="Save changes"
          onSuccess={close}
        />
      </DialogContent>
    </Dialog>
  );
}
