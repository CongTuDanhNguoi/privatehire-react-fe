// Gắn hành động "bấm" cho các phần tử trong code Figma xuất ra mà KHÔNG sửa code Figma.
// Code Figma giữ nguyên thuộc tính data-node-id, nên chỉ cần khai báo:
//   <FigmaClickable actions={{ "6:1101": () => navigate("/services") }}> <Component1Home /> </FigmaClickable>
import type { MouseEvent, ReactNode } from "react";

interface FigmaClickableProps {
  actions: Record<string, () => void>;
  children: ReactNode;
}

export default function FigmaClickable({ actions, children }: FigmaClickableProps) {
  function handleClick(e: MouseEvent<HTMLDivElement>) {
    let el = e.target as Element | null;
    while (el && el !== e.currentTarget) {
      const id = el.getAttribute("data-node-id");
      if (id && actions[id]) {
        e.preventDefault();
        actions[id]();
        return;
      }
      el = el.parentElement;
    }
  }

  const pointerCss = Object.keys(actions)
    .map((id) => `[data-node-id="${id}"]{cursor:pointer}`)
    .join("");

  return (
    <div onClick={handleClick} className="contents">
      <style>{pointerCss}</style>
      {children}
    </div>
  );
}
