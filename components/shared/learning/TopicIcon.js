import { FaCode, FaHtml5, FaReact, FaNodeJs, FaGitAlt } from "react-icons/fa";
import { SiJavascript, SiNextdotjs } from "react-icons/si";

export default function TopicIcon({ topic }) {
  const normalized = topic?.toLowerCase() || "";
  const Icon = normalized.includes("react")
    ? FaReact
    : normalized.includes("next")
      ? SiNextdotjs
      : normalized.includes("javascript")
        ? SiJavascript
        : normalized.includes("node")
          ? FaNodeJs
          : normalized.includes("git")
            ? FaGitAlt
            : normalized.includes("html") || normalized.includes("css")
              ? FaHtml5
              : FaCode;
  return <Icon aria-hidden="true" />;
}
