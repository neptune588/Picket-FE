import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";

import styled from "styled-components";
import AddButton from "@/assets/icons/addbutton.svg?react";

const Dropzone = styled.div`
  width: 510px;
  height: 510px;
  margin-right: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme: { colors } }) => {
    return colors.gray["20"];
  }};
  color: ${({ theme: { colors } }) => {
    return colors.gray["80"];
  }};
  border-radius: 25px;
  overflow: hidden;
`;

const GuideBox = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const AddButtonIcon = styled(AddButton)`
  display: block;
  margin: 0 auto;
  pointer-events: none;
`;

const AddImgMsg = styled.p`
  margin-top: 20px;
  text-align: center;
  color: ${({ theme: { colors } }) => {
    return colors.gray["80"];
  }};
  font-size: ${({ theme: { typo } }) => {
    return typo.size.md;
  }};
  white-space: pre-line;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  margin: 0 auto;
  object-fit: cover;
`;

export default function MyDropzone({ contextFile, updateContextFile }) {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFile) => {
    setFiles(
      acceptedFile.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          origin: file,
        })
      )
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".svg", ".gif"],
    },
    onDrop,
  });

  useEffect(() => {
    if (files.length > 0) {
      updateContextFile(files[0].origin);
      setPreview(files[0].preview);
    }
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <Dropzone {...getRootProps()}>
      <input {...getInputProps()} onChange={onDrop} />
      {isDragActive ? (
        <GuideBox>
          {preview ? (
            <Img
              src={preview}
              onLoad={() => {
                URL.revokeObjectURL(preview);
              }}
            />
          ) : (
            <>
              <AddButtonIcon />
              <AddImgMsg>이곳에 끌어다놓으세요</AddImgMsg>
            </>
          )}
        </GuideBox>
      ) : (
        <GuideBox>
          {preview ? (
            <Img
              src={preview}
              onLoad={() => {
                URL.revokeObjectURL(preview);
              }}
            />
          ) : (
            <>
              <AddButtonIcon />
              <AddImgMsg>
                이미지를 선택하거나
                <br />
                끌어놓으세요.
              </AddImgMsg>
            </>
          )}
        </GuideBox>
      )}
    </Dropzone>
  );
}
