import React from "react";

export default function SystemStatus() {
  return <script async src={process.env.NEXT_PUBLIC_STATUS_PAGE_CODE} />;
}
