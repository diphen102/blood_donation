import { Typography } from "antd";
import { CheckOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { STATUS_STEPS } from "../constants/bloodUnitStatus";

export function findHistoryDate(history, status) {
  const entry = (history || []).find((h) => h.status === status);
  return entry ? new Date(entry.date).toLocaleDateString("vi-VN") : null;
}

export default function BloodUnitJourney({ unit }) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.value === unit.status);
  const isDiscarded = unit.status === "DISCARDED";
  const testedIndex = STATUS_STEPS.findIndex((s) => s.value === "TESTED");

  return (
    <>
      <ul className="journey-timeline">
        {STATUS_STEPS.map((step, i) => {
          if (isDiscarded && i > testedIndex) return null;
          const done = isDiscarded ? i <= testedIndex : i <= currentIndex;
          const date = findHistoryDate(unit.statusHistory, step.value);
          return (
            <li key={step.value} className={`journey-step ${done ? "journey-step--done" : ""}`}>
              <span className="journey-step__dot">{done ? <CheckOutlined /> : i + 1}</span>
              <div className="journey-step__label">
                {step.label}
                {step.value === "USED" && unit.department && <span style={{ fontWeight: 400, color: "#6B7280" }}> — {unit.department}</span>}
                {(step.value === "DISPATCHED" || step.value === "RECEIVED" || step.value === "USED") && unit.currentHospital?.name && (
                  <span style={{ fontWeight: 400, color: "#6B7280" }}> — {unit.currentHospital.name}</span>
                )}
              </div>
              {date && <div className="journey-step__date">{date}</div>}
            </li>
          );
        })}
        {isDiscarded && (
          <li className="journey-step journey-step--done">
            <span className="journey-step__dot" style={{ background: "#8E2430" }}><CloseCircleOutlined /></span>
            <div className="journey-step__label" style={{ color: "#8E2430" }}>Huỷ — không đạt xét nghiệm</div>
            {unit.testFailReason && <div className="journey-step__date">Lý do: {unit.testFailReason}</div>}
            {unit.testRecommendation && <div className="journey-step__date">Khuyến nghị: {unit.testRecommendation}</div>}
            {findHistoryDate(unit.statusHistory, "DISCARDED") && (
              <div className="journey-step__date">{findHistoryDate(unit.statusHistory, "DISCARDED")}</div>
            )}
          </li>
        )}
      </ul>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Trạng thái hiện tại: <b>{unit.status}</b>
      </Typography.Text>
    </>
  );
}
