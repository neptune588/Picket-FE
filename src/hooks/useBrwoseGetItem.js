import { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useInView } from "react-intersection-observer";
import {
  setTotalParams,
  setPrevParams,
  setPageParams,
  setCategoryListParams,
  setLastBoardParams,
} from "@/store/parameterSlice";
import {
  setThumnailCard,
  deleteThumnailCard,
} from "@/store/bucketThumnailSlice";
import { setDetailBucketModal } from "@/store/modalsSlice";
import { setDetailButcket, setScrollLocation } from "@/store/bucketDetailSlice";

import { getData } from "@/services/api";
import { postData } from "@/services/api";
import { delData } from "@/services/api";
import { patchData } from "@/services/api";

import useSelectorList from "@/hooks/useSelectorList";
import { categoriesData } from "@/pages/Browse/categoryData";

export default function useBrwoseGetItem() {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const { keyword: curKeyword } = useParams();

  const {
    page,
    keyword,
    categoryList,
    prevParams,
    totalParams,
    thumnailCards,
    detailModal,
    bucketDetailData,
    curScrollLocation,
  } = useSelectorList();

  const [dummy, setDummy] = useState([
    { id: "sklt01" },
    { id: "sklt02" },
    { id: "sklt03" },
    { id: "sklt04" },
    { id: "sklt05" },
    { id: "sklt06" },
    { id: "sklt07" },
    { id: "sklt08" },
  ]);
  //데이터
  const [cardData, setCardData] = useState([]);
  //active관련
  const [categoryData, setCategoryData] = useState([...categoriesData]);
  //마지막 페이지인가?
  const [lastPage, setLastPage] = useState(false);
  //데이터 불러오는동안 스켈레톤 띄우기
  const [isLoading, setIsLoading] = useState(true);
  const [CardDetailData, setCardDetailData] = useState({});
  //첫 렌더링시 강제실행 막기
  const mounted01 = useRef(false);
  const mounted02 = useRef(false);
  const mounted03 = useRef(false);
  const mounted04 = useRef(false);
  //렌더링할때 화면이 비게되면 옵저버가 관측이 되어서 스크롤된것처럼 되기 때문에
  //그것을 위한 더미 옵저버
  const dummyObserver = useRef();
  //트리거가 발동했을때 초기치로 리셋
  const page_board_data_reset = () => {
    //value 즉 페이지숫자는 스크롤 제외하고 트리거 발동때마다 리셋되어야하니까 0으로 주기
    dispatch(setPageParams([`page=`, 0]));
    dispatch(setLastBoardParams(["", ""]));
    dispatch(deleteThumnailCard());

    setIsLoading(true);
    setLastPage(false);
  };

  const { ref: observerRef } = useInView({
    threshold: 0,
    onChange: (view) => {
      //스크롤 내렸을때 라스트페이지가 아닐때
      if (view && !lastPage) {
        dispatch(setPageParams([`${page.key}`, `${parseInt(page.value) + 1}`]));
        dispatch(
          setLastBoardParams([
            "&lastBoardId=",
            `${cardData[cardData.length - 1].boardId}`,
          ])
        );
        dispatch(setTotalParams());
      }
    },
  });

  //전체 카테고리로 활성화
  const activeAllCategory = () => {
    return categoryData.map((data, idx) => {
      return {
        ...data,
        activeState: idx === 0 ? true : false,
      };
    });
  };
  //클릭한 카테고리 활성화, 다른카테고리를누르면 전체카테고리는 비활성화되어야한다.
  const activeCategory = (nowNumber) => {
    return categoryData.map((data, idx) => {
      if (idx === 0) {
        return { ...data, activeState: false };
      } else {
        return {
          ...data,
          activeState: idx === nowNumber ? !data.activeState : data.activeState,
        };
      }
    });
  };
  //중첩된 리스트이면 제거, 없는 리스트만 추가
  const categoryQueryCheck = (query) => {
    const inspect = [...categoryList.value];
    inspect.indexOf(query) === -1
      ? inspect.push(query)
      : inspect.splice(inspect.indexOf(query), 1);

    return inspect;
  };

  const handleCategoryClick = (activeNum, curQuery) => {
    return () => {
      if (activeNum === 0) {
        setCategoryData(activeAllCategory());
        if (prevParams.value === totalParams.value) {
          return;
        } else {
          page_board_data_reset();

          dispatch(setCategoryListParams(["", []]));
          dispatch(setTotalParams());
          //파람바껴서 데이터 불러오고 한번 데이터 뿌려준뒤에 prev param갱신 -> 데이터는 보존 된채로 클릭만 막아진다.
          dispatch(setPrevParams());
          //console.log("현재 prevparam은", prevParams.value);
        }

        //console.log(cardData.length);
      } else {
        //바꾼배열 반환받아서 검사
        const condition = activeCategory(activeNum).every((data) => {
          return data.activeState === false;
        });

        if (condition) {
          setCategoryData(activeAllCategory());
          page_board_data_reset();

          dispatch(setCategoryListParams(["", []]));
          dispatch(setTotalParams());
        } else {
          setCategoryData(activeCategory(activeNum));
          page_board_data_reset();

          dispatch(
            setCategoryListParams([
              "&categoryList=",
              categoryQueryCheck(curQuery),
            ])
          );
          dispatch(setTotalParams());
        }
      }
    };
  };

  const cardReq = async (query = "") => {
    try {
      setIsLoading(true);
      const { data } = await getData(`/board/list/search?${query}`);

      //console.log(data);

      if (data.content?.length > 0) {
        if (data.last) {
          //마지막페이지 검증로직
          //라스트페이지면 스켈레톤x axios호출x
          setLastPage(true);
          dispatch(setThumnailCard(data.content));

          setIsLoading(false);

          return;
        } else {
          setLastPage(false);
          dispatch(setThumnailCard(data.content));

          setIsLoading(false);
        }
      } else {
        setLastPage(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Oh~ :", error);
    }
  };

  const cardDetailReq = async (borardNum) => {
    try {
      const { data } = await getData(`/board/${borardNum}`);
      data.commentList.forEach((obj) => (obj.putOptions = false));

      dispatch(
        setDetailButcket({
          boardId: data.boardId,
          title: data.title,
          categoryList: data.categoryList,
          cardContent: data.content,
          cardImg: data.filepath,
          created: data.deadline.split("-").join("."),
          commentList: data.commentList,
          heartCount: data.heartCount,
          scrapCount: data.scrapCount,
          nickname: data.nickname,
          avatar: data.profileImg,
        })
      );

      const latestBucket = JSON.parse(localStorage.getItem("latestBucket"));

      const latestCard = cardData.find((card) => card.boardId === borardNum);
      if (latestBucket) {
        const refine = [...latestBucket];
        !refine.some((card) => card.boardId === borardNum) &&
          refine.push(latestCard);

        refine.length > 4 && refine.splice(0, 1);
        localStorage.setItem("latestBucket", JSON.stringify(refine));
      } else {
        localStorage.setItem("latestBucket", JSON.stringify([latestCard]));
      }
      !detailModal && dispatch(setDetailBucketModal());

      //console.log(data);
    } catch (error) {
      if (error.response.status === 401) {
        console.error("error입니다.");
      }
      console.error("Oh~", error);
    }
  };

  const handleDetailView = (curBoardId) => {
    return () => {
      dispatch(setScrollLocation(window.scrollY));
      cardDetailReq(curBoardId);
    };
  };

  const handleDetailModalState = () => {
    detailModal && dispatch(setDetailBucketModal());
    setTimeout(() => {
      window.scroll({ top: curScrollLocation, left: 0 });
    }, 50);
  };

  const likeAndScrapReq = useMutation({
    mutationFn: async (curData) => {
      const token = `Bearer ${JSON.parse(
        localStorage.getItem("userAccessToken")
      )}`;
      return await postData(`/board/${curData}`, null, {
        headers: {
          Authorization: token,
        },
      });
    },
    onSuccess: async (res) => {
      //페이지로 산정되지 않는 짜투리 갯수를 위해 + 8 한번더
      const { data } = await getData(
        `/board/list/search?size=${page.value * 8 + 8}${
          keyword.key + keyword.value
        }${categoryList.key + categoryList.value}`
      );
      dispatch(deleteThumnailCard());
      dispatch(setThumnailCard(data.content));
      //console.log(res);
    },

    onError: (error) => {
      if (error.response.status) {
        console.log("에러러");
      }
    },
  });

  const detailLikeAndScrapReq = useMutation({
    mutationFn: async (curData) => {
      const token = `Bearer ${JSON.parse(
        localStorage.getItem("userAccessToken")
      )}`;
      return await postData(`/board/${curData}`, null, {
        headers: {
          Authorization: token,
        },
      });
    },
    onSuccess: async () => {
      cardDetailReq(bucketDetailData.boardId);
      try {
        const { data } = await getData(
          `/board/list/search?size=${page.value * 8 + 8}${
            keyword.key + keyword.value
          }${categoryList.key + categoryList.value}`
        );
        dispatch(deleteThumnailCard());
        dispatch(setThumnailCard(data.content));
      } catch (error) {
        console.error("받아오는데서 에러 뜸");
      }
    },
    onError: (error) => {
      if (error.response.status) {
        console.log("에러러");
      }
    },
  });

  const handleHeartAndScrapClick = (type, curBoardId) => {
    return () => {
      const condition = localStorage.getItem("userAccessToken");
      if (!condition) {
        const question = confirm(
          "로그인을 하셔야 이용 가능합니다. 로그인 하시겠습니까?"
        );
        question && navigate("/auth/signin");
        return;
      } else {
        switch (type) {
          case "heart": {
            likeAndScrapReq.mutate(`${curBoardId}/like`);
            break;
          }
          case "scrap": {
            likeAndScrapReq.mutate(`${curBoardId}/scrap`);
            break;
          }
        }
      }
    };
  };

  const handleDetailHeartAndScrapClick = (type, curBoardId) => {
    return () => {
      const condition = localStorage.getItem("userAccessToken");
      if (!condition) {
        const question = confirm(
          "로그인을 하셔야 이용 가능합니다. 로그인 하시겠습니까?"
        );
        question && navigate("/auth/signin");
        return;
      } else {
        switch (type) {
          case "heart": {
            detailLikeAndScrapReq.mutate(`${curBoardId}/like`);
            break;
          }
          case "scrap": {
            detailLikeAndScrapReq.mutate(`${curBoardId}/scrap`);
            break;
          }
        }
      }
    };
  };

  const detailBucketDelete = useMutation({
    mutationFn: async (curBoardId) => {
      const token = `Bearer ${JSON.parse(
        localStorage.getItem("userAccessToken")
      )}`;
      return await delData(`/board/${curBoardId}`, {
        headers: {
          Authorization: token,
        },
      });
    },
    onSuccess: async () => {
      try {
        const { data } = await getData(
          `/board/list/search?size=${page.value * 8 + 8}${
            keyword.key + keyword.value
          }${categoryList.key + categoryList.value}`
        );

        dispatch(deleteThumnailCard());
        dispatch(setThumnailCard(data.content));

        alert("버킷이 삭제 되었습니다!");
        dispatch(setDetailBucketModal());
      } catch (error) {
        console.error("Oh~ :", error);
      }
    },
    onError: (error) => {
      if (error.response.status === 401) {
        alert("권한이 없습니다!");
      }
    },
  });

  const handleDetailBucketDelete = (curBoardId) => {
    return () => {
      confirm("버킷을 삭제하시겠습니까?") &&
        detailBucketDelete.mutate(curBoardId);
    };
  };

  const detailBucketComplete = useMutation({
    mutationFn: async (curData) => {
      const token = `Bearer ${JSON.parse(
        localStorage.getItem("userAccessToken")
      )}`;
      return await patchData(`/board/${curData}/complete`, null, {
        headers: {
          Authorization: token,
        },
      });
    },
    onSuccess: async () => {
      try {
        cardDetailReq(bucketDetailData.boardId);

        const token = `Bearer ${JSON.parse(
          localStorage.getItem("userAccessToken")
        )}`;
        const { data } = await getData(
          `/board/list/search?size=${page.value * 8 + 8}${
            keyword.key + keyword.value
          }${categoryList.key + categoryList.value}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        dispatch(deleteThumnailCard());
        dispatch(setCardData(data.content));

        alert("버킷을 달성하셨습니다!");
      } catch (error) {
        console.error("Oh~ :", error);
      }
    },
    onError: (error) => {
      if (error.response.status === 409) {
        alert("이미 달성한 버킷입니다!");
      } else {
        console.log("에러러");
      }
    },
  });

  const handleDetailBucketComplete = (curBoardId) => {
    return () => {
      confirm("버킷을 달성하시겠습니까?") &&
        detailBucketComplete.mutate(curBoardId);
    };
  };

  //시작시 리스트 불러옴
  useEffect(() => {
    //비워줘야지 다른 페이지갔다 다시 와서 카테구리 누를때 []이 디폴트인상태에서 됨. 즉 처음페이지에 온것처럼 됨.
    //다른페이지에서 검색을했을때의 경우를 대비하여 totalparmas를 변경해준다.
    //검색창에서 keyword값이 갱신되므로 setotal로 바뀐값 갱신해주면 다른사이트에서 이동했을때에도 마찬가지로 목록이 뿌려짐
    if (curKeyword !== "default") {
      dispatch(setTotalParams());
      dispatch(setPrevParams());
      /*       console.log(
        "검색을 하셨습니다. 비어잇는 디펜던시의 useEffect가 실행됩니다."
      ); */
    } else {
      /*       console.log(
        "검색을 제외한 데이터를 초기화하고 렌더링이 실행 되었습니다."
      ); */
      page_board_data_reset();
      dispatch(setCategoryListParams(["", []]));
      cardReq(`${page.key + 0}`);
    }
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    if (!mounted02.current) {
      mounted02.current = true;
    } else {
      /*       console.log(
        "검색을 제외한 데이터를 초기화하고 totalparam이 바뀌었습니다."
      ); */
      page_board_data_reset();
      dispatch(setCategoryListParams(["", []]));
      setCategoryData(activeAllCategory());

      dispatch(setTotalParams());
      dispatch(setPrevParams());
      //console.log(prevParams.value);
    }
  }, [curKeyword]);

  useEffect(() => {
    if (!mounted04.current) {
      mounted04.current = true;
    } else {
      setCardData(thumnailCards.data);
    }
  }, [thumnailCards.data]);

  useEffect(() => {
    //데이터 없으면 옵저버 못보게 더미 on 데이터 있으면 off
    if (dummyObserver.current && cardData.length > 0) {
      dummyObserver.current.style.display = "none";
    } else if (dummyObserver.current && cardData.length === 0) {
      dummyObserver.current.style.display = "block";
    }
  }, [cardData]);

  useEffect(() => {
    if (!mounted01.current) {
      mounted01.current = true;
    } else {
      //console.log("totalparam이 바꼈으므로 목록을 불러옵니다.");
      cardReq(totalParams.value);
    }
  }, [totalParams.value]);

  useEffect(() => {
    if (!mounted03.current) {
      mounted03.current = true;
    } else {
      setCardDetailData(bucketDetailData);
    }
  }, [bucketDetailData]);

  return {
    dummy,
    keyword,
    categoryData,
    cardData,
    isLoading,
    dummyObserver,
    CardDetailData,
    detailModal,
    cardDetailReq,
    observerRef,
    handleCategoryClick,
    handleDetailView,
    handleDetailModalState,
    handleHeartAndScrapClick,
    handleDetailHeartAndScrapClick,
    handleDetailBucketDelete,
    handleDetailBucketComplete,
  };
}

//느낀것

//api관련 동작 중 쿼리스트링 같은 정확하게 전달해야하는 정보는
//비동기 방식이 아닌 동기 방식으로 적용하는게 좋을것같다.
//setState와 디펜던시로 해결하기엔 너무 복잡해져서 리덕스툴킷의 reducer set함수를 통해 동기적으로 작동하고
//데이터(쿼리)를 덮어씌우는 방식으로 작업했는데, 덕분에 구현이 된것같다.
