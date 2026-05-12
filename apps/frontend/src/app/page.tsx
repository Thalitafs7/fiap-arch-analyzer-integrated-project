"use client";

import { useState } from "react";
import axios from "axios";
import { UploadCloud, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        username: "admin",
        password: "admin"
      });
      setToken(res.data.access_token);
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      setAnalysisId(res.data.analysisId);
      setStatus("QUEUED");
      pollStatus(res.data.analysisId);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:3000/reports/${id}/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatus(res.data.status);
        if (res.data.status === "ANALYZED") {
          clearInterval(interval);
          fetchReport(id);
        } else if (res.data.status === "ERROR") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  };

  const fetchReport = async (id: string) => {
    try {
      const res = await axios.get(`http://localhost:3000/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-10 font-sans text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Architecture Analyzer</h1>

      {!token ? (
        <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Login as Admin
        </button>
      ) : (
        <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-md">
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <label className="border-2 border-dashed border-gray-300 rounded p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {file ? file.name : "Click to select diagram (PNG, JPG, PDF)"}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <button
              type="submit"
              disabled={!file || loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Analyze Diagram"}
            </button>
          </form>

          {status && (
            <div className="mt-6 p-4 rounded bg-gray-100 flex items-center gap-3">
              {status === "ANALYZED" ? <CheckCircle className="text-green-500" /> : status === "ERROR" ? <AlertCircle className="text-red-500" /> : <Loader className="animate-spin text-blue-500" />}
              <span className="font-medium">Status: {status}</span>
            </div>
          )}

          {report && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Analysis Report</h2>
              <p className="mb-4"><strong>Score:</strong> {report.score}</p>
              <p className="mb-4"><strong>Summary:</strong> {report.summary}</p>

              <h3 className="font-bold mt-4 mb-2">Risks</h3>
              <ul className="list-disc pl-5">
                {report.risks?.map((r: any, i: number) => (
                  <li key={i} className="text-red-600">{r.severity}: {r.description}</li>
                ))}
              </ul>

              <h3 className="font-bold mt-4 mb-2">Recommendations</h3>
              <ul className="list-disc pl-5">
                {report.recommendations?.map((r: any, i: number) => (
                  <li key={i} className="text-blue-600">{r.description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
