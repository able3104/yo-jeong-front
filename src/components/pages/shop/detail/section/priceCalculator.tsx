import { CircleQuestionMark } from "lucide-react";
import { phonePlans } from "../../../../../contents/phonePlans";
import Select from "../../../../common/select";
import SectionHeader from "./header";
import { useSetAtom } from "jotai";
import { calculatorModalOpenAtom } from "../../../../common/modal/calculator/atom";
import { useEffect, useState } from "react";
import { getSubsidy } from "../../../../../apis";
import { firstPhonePlans } from "../../../../../contents/firstPhonePlanData";

interface PriceCalculatorProps {
  telecom: string;
  phonePrice: number;
  phoneOriginalPrice: number;
  selectedPhonePlan: {
    name: string;
    price: number;
  } | null;
  setSelectedPhonePlan: React.Dispatch<
    React.SetStateAction<{ name: string; price: number } | null>
  >;
}

const PriceCalculator = ({
  telecom,
  phonePrice,
  phoneOriginalPrice,
  selectedPhonePlan,
  setSelectedPhonePlan,
}: PriceCalculatorProps) => {
  const calculatorModalOpen = useSetAtom(calculatorModalOpenAtom);

  const [commonDiscount, setCommonDiscount] = useState(0);

  const firstPlanPrice = telecom
    ? firstPhonePlans[telecom as keyof typeof firstPhonePlans]
    : 0;
  const plans = telecom ? phonePlans[telecom as keyof typeof phonePlans] : [];
  const totalPrice =
    (phonePrice +
      firstPlanPrice * 6 +
      (selectedPhonePlan ? selectedPhonePlan.price * 18 : 0)) /
    24;

  const handleDetailClick = () => {
    if (selectedPhonePlan === null) return;
    calculatorModalOpen({
      month: 24,
      phonePrice,
      firstPhonePlanPrice: firstPlanPrice,
      selectedPhonePlanPrice: selectedPhonePlan.price,
      commonDiscountPrice: commonDiscount,
      phoneOriginalPrice: phoneOriginalPrice,
    });
  };

  useEffect(() => {
    // 공통 할인금액(공시지원금) 조회
    const fetchCommonDiscount = async () => {
      try {
        const amount = await getSubsidy(telecom);
        setCommonDiscount(amount);
      } catch (error) {
        console.error("Failed to fetch common discount:", error);
      }
    };
    fetchCommonDiscount();
  }, [telecom]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <SectionHeader title="24개월 예상 지출 금액" />
      <div className="flex flex-col gap-3">
        <Select.Group
          selectedOption={selectedPhonePlan}
          onChange={setSelectedPhonePlan}
        >
          {plans.map((plan) => (
            <Select.Option
              key={plan.name}
              name={plan.name}
              price={plan.price}
              description={plan.description}
            />
          ))}
        </Select.Group>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col items-center gap-2 px-5 py-4 border border-gray-light rounded-xl">
            <p className="text-lg">24개월간 매달 납부하실 금액은?</p>
            <p className="flex items-center gap-1 text-blue-primary text-[22px] font-semibold">
              {selectedPhonePlan ? (
                <>
                  <span className="text-base font-medium">월</span>
                  {`${totalPrice.toLocaleString("ko-KR")}원`}
                </>
              ) : (
                "-"
              )}
            </p>
          </div>
          <button
            onClick={handleDetailClick}
            className="flex items-center gap-1 w-full px-2 text-gray-dark text-[13px] font-medium"
          >
            <CircleQuestionMark size={14} />
            세부 내역이 궁금하신가요?
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
