import { type InputHTMLAttributes, forwardRef } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    const { ...rest } = props;

    return (
      <input
        className="border-red-500 bg-sky-200 text-gray-500"
        {...rest}
        ref={ref}
      />
    );
  },
);

TextField.displayName = "TextField";
