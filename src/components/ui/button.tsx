import { type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";

type BaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };
type AnchorProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" };

type Props = ButtonProps | AnchorProps;

const base =
  "inline-flex items-center justify-center gap-2 font-medium leading-none rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-[#171717] text-white hover:bg-[#383838] shadow-[0_0_0_1px_rgba(0,0,0,0.04)]",
  secondary:
    "bg-white text-[#171717] border border-[#ebebeb] hover:border-[#a1a1a1] hover:bg-[#fafafa]",
  ghost: "text-[#4d4d4d] hover:text-[#171717] hover:bg-[#f5f5f5]",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
};

export function Button({ variant = "primary", size = "md", as, ...props }: Props) {
  const className = [
    base,
    variants[variant],
    sizes[size],
    (props as { className?: string }).className ?? "",
  ].join(" ");

  if (as === "a") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { className: _cls, ...rest } = props as AnchorProps;
    return <a className={className} {...rest} />;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { className: _cls, ...rest } = props as ButtonProps;
  return <button className={className} {...rest} />;
}
