"use client";

import React from "react";
import { toast } from "react-hot-toast";

export type ConfirmToastOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "info";
};

export const confirmToast = ({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
}: ConfirmToastOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    const id = toast.custom(
      (t) => (
        <div
          className={
            "pointer-events-auto w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-xl transition-all " +
            (t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2")
          }
          role="alertdialog"
          aria-live="assertive"
        >
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            {description ? (
              <p className="mt-1 text-xs text-slate-600">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                toast.dismiss(id);
                resolve(false);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(id);
                resolve(true);
              }}
              className={
                "rounded-lg px-3 py-1.5 text-xs font-semibold text-white " +
                (tone === "danger"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-blue-600 hover:bg-blue-700")
              }
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-right",
      }
    );
  });
};
