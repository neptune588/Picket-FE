import styled from "styled-components";

const Container = styled.ul`
  display: flex;
  > li {
    margin-right: 40px;
    margin-top: 40px;
    &:nth-child(4n) {
      margin-right: 0px;
    }
  }
  flex-wrap: wrap;
  padding-bottom: 40px;
`;

const BucketNotContainer = styled.div`
  display: flex;
  height: 50vh;
  justify-content: center;
  align-items: center;
  > p {
    font-size: ${({ theme: { typo } }) => {
      return typo.size.xl;
    }};
    color: ${({ theme: { colors } }) => {
      return colors.gray["40"];
    }};
    font-weight: ${({ theme: { typo } }) => {
      return typo.weight.bold;
    }};
  }
`;

const SubTitle = styled.h2`
  margin: 75px 0 50px;
  font-size: ${({ theme: { typo } }) => {
    return typo.size.xl;
  }};
  font-weight: ${({ theme: { typo } }) => {
    return typo.weight.bold;
  }};
`;

const CategoryBox = styled.ul`
  display: flex;
  > li {
    margin-right: 15px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

export { Container, BucketNotContainer, CategoryBox, SubTitle };
