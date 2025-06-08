import React from "react";

const InputField = ({
  Labelname,
  type,
  placeholder,
  labelstyle,
  inputStyle,
  divstyle,
  name,
  htmlFor,
  id,
  onChange,
  values,
  disabled,
  maxLength,
  pattern,
  innerDiv,
  readOnly,
  imgClick,
  inputRef,
  trailingImage, // New prop for the image
  imageStyle, // Optional: Style for the image
}) => {
  return (
    <div className={divstyle}>
      {Labelname && (
        <label htmlFor={htmlFor} className={labelstyle}>
          {Labelname}
        </label>
      )}
      <div className={`flex items-center ${innerDiv}`}>
        <input
          id={id}
          name={name}
          onChange={onChange}
          value={values}
          className={`placeholder-placeHolder focus:outline-none ${inputStyle} ${
            trailingImage ? "pl-1" : ""
          }`}
          type={type}
          maxLength={maxLength}
          pattern={pattern}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          readOnly={readOnly}
          ref={inputRef}
        />
        {trailingImage && (
          <img
            onClick={imgClick}
            src={trailingImage}
            alt=""
            className={imageStyle}
          />
        )}
      </div>
    </div>
  );
};

export default InputField;
