import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AgencyDetailResponse, getAgencyDetail } from "../../../../apis";
import { AxiosError } from "axios";
import Header from "../../../layout/header";
import Content from "../../../layout/content";
import ProductHero from "./section/productHero";
import FnqBanner from "./section/fnqBanner";
import DiscountSelector from "./section/discountSelector";
import PriceCalculator from "./section/priceCalculator";
import BenefitCard from "./section/benefitCard";
import ProcessStep from "./section/processStep";
import PolicyAccordion from "./section/policyAccordion";
import BottomCTABar from "../../../layout/bottomCTABar";
import { cn } from "cn-func";
import { useSetAtom } from "jotai";
import { loginModalOpenAtom } from "../../../common/modal/login/atom";
import { useAuth } from "../../../auth/authProvider";
import NaverMaps from "./section/NaverMaps";

const ShopDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);
  const [agencyDetail, setAgencyDetail] = useState<AgencyDetailResponse | null>(
    null
  );
  const { currentUser } = useAuth();
  const loginModalOpen = useSetAtom(loginModalOpenAtom);

  const agencyId = searchParams.get("agency_id");
  const brand = searchParams.get("phone_brand");
  const device = searchParams.get("phone_name");
  const carrier = searchParams.get("telecom");
  const subscriptionType = searchParams.get("subscription_type");

  // 고객 선택 상태값들
  const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([0]);
  const [selectedPhonePlan, setSelectedPhonePlan] = useState<{
    name: string;
    price: number;
  } | null>(null);

  const handleQuoteButtonClick = () => {
    // 임시로
    if (selectedPhonePlan === null) {
      alert("요금제를 선택해주세요.");
      return;
    }

    if (currentUser) {
      // 견적서 받기 진행
      if (agencyDetail === null) return;
      navigate(
        `/quote?agency_id=${agencyId}&phone_brand=${brand}&phone_name=${device}&phone_price=${
          agencyDetail.phonePrice
        }&phone_plan=${encodeURIComponent(
          JSON.stringify(selectedPhonePlan || {})
        )}&discount=${encodeURIComponent(
          JSON.stringify(selectedDiscounts) || "[]"
        )}&subscription_type=${subscriptionType}&telecom=${carrier}`
      );
    } else {
      // 모달열기
      loginModalOpen({
        subtitle: "견적서 발급을 위해",
        title: "로그인이 필요해요",
        afterFunction: () => {
          if (agencyDetail === null) return;
          navigate(
            `/quote?agency_id=${agencyId}&phone_brand=${brand}&phone_name=${device}&phone_price=${
              agencyDetail.phonePrice
            }&phone_plan=${encodeURIComponent(
              JSON.stringify(selectedPhonePlan || {})
            )}&discount=${encodeURIComponent(
              JSON.stringify(selectedDiscounts) || "[]"
            )}&subscription_type=${subscriptionType}&telecom=${carrier}`
          );
        },
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!agencyId || !brand || !device || !carrier || !subscriptionType)
        return;
      setIsLoading(true);
      try {
        const res = await getAgencyDetail({
          agencyId: Number(agencyId),
          phoneBrand: brand,
          phoneName: device,
          telecom: carrier,
          subscriptionType: subscriptionType,
        });
        setAgencyDetail(res);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error("API Error:", error.response?.data);
          setIsError(
            error.response?.status === 404
              ? "조건에 맞는 대리점이 없습니다."
              : "대리점 상세정보를 불러오는 중 오류가 발생했습니다."
          );
          setIsLoading(false);
        } else {
          console.error("Unexpected Error:", error);
          setIsError("대리점 상세정보를 불러오는 중 오류가 발생했습니다.");
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [agencyId, brand, device, carrier, subscriptionType]);

  if (
    !agencyId ||
    !brand ||
    !device ||
    !carrier ||
    !subscriptionType ||
    (!isLoading && isError)
  ) {
    return (
      <>
        <Header
          title="대리점 조회 오류"
          subTitle="죄송합니다. 대리점 정보를 불러올 수 없습니다."
          backButton
          backButtonHandler={() => navigate(-1)}
        />
        <Content className="text-center">
          <p className="text-base font-semibold text-red-600">
            대리점 상세정보를 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="text-sm text-gray-dark">다시 시도해주세요.</p>
        </Content>
      </>
    );
  }

  if (isError || !agencyDetail) return null;

  return (
    <>
      <Header
        title={isLoading ? "대리점 정보 조회중" : agencyDetail.agencyName}
        subTitle={
          isLoading ? "잠시만 기다려주세요." : agencyDetail.agencyAddress
        }
        backButton
        backButtonHandler={() => navigate(-1)}
      />
      <Content className="px-0 pt-4 bg-white" bottomCTABar>
        {isLoading ? (
          <p className="text-base font-semibold text-gray-dark">
            대리점 정보를 불러오는 중입니다...
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <ProductHero imageUrl={agencyDetail.phoneImage} {...agencyDetail} />
            <FnqBanner />
            <DiscountSelector
              selectedDiscounts={selectedDiscounts}
              setSelectedDiscounts={setSelectedDiscounts}
            />
            <PriceCalculator
              telecom={carrier}
              phonePrice={agencyDetail.phonePrice}
              phoneOriginalPrice={agencyDetail.phoneOriginalPrice}
              selectedPhonePlan={selectedPhonePlan}
              setSelectedPhonePlan={setSelectedPhonePlan}
            />
            <NaverMaps />
            <BenefitCard />
            <ProcessStep />
            <PolicyAccordion />
          </div>
        )}
      </Content>
      <BottomCTABar>
        <button
          className={cn(
            "w-full h-14 bg-blue-primary rounded-2xl",
            "text-white font-semibold"
          )}
          onClick={handleQuoteButtonClick}
        >
          견적서 받고 최저가로 바로 개통!
        </button>
      </BottomCTABar>
    </>
  );
};

export default ShopDetailPage;
