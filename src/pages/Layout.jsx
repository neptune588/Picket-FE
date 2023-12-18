import { Outlet } from "react-router-dom";

import styled from "styled-components";

import NavBar from "@/components/NavBar/NavBar";

const CenterdContainer = styled.div`
  width: 1440px;
  margin: 0 auto;
`;
export default function LayOut() {
  return (
    <>
      <NavBar />
      <CenterdContainer>
        <Outlet />
      </CenterdContainer>
    </>
  );
}
