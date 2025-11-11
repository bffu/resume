"use client";

import React, { useState } from "react";
import type { ResumeData } from "@/types/resume";
import ResumePreview from "@/components/resume-preview";

export default function PrintContent({ initialData }: { initialData?: ResumeData | null }) {
  // 避免在 effect 中同步 setState：使用惰性初始化从 sessionStorage 恢复
  const [resumeData] = useState<ResumeData | null>(() => {
    if (initialData) return initialData;
    if (typeof window !== "undefined") {
      try {
        const s = sessionStorage.getItem("resumeData");
        if (s) return JSON.parse(s) as ResumeData;
      } catch { }
    }
    return null;
  });

  return (
    <div className="pdf-preview-mode">
      {resumeData ? (
        <ResumePreview resumeData={resumeData} />
      ) : (
        <div className="resume-content p-8">
          <h1 className="text-xl font-bold mb-4">无法加载简历数据</h1>
          <p className="text-muted-foreground">请通过后端生成接口或附带 data 参数访问本页面。</p>
        </div>
      )}
    </div>
  );
}
