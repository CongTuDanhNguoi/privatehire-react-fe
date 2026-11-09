// =============================================================
// JourneyDetailsPage — dùng code Figma "Screen 1 — Journey Details (Completed)" (6:1493).
// Chỉ thay: icon + tên + mô tả trong thẻ "SELECTED SERVICE" -> lấy theo dịch vụ đã chọn.
// Nút Change / Back -> quay lại Service Selection (giữ lựa chọn hiện tại).
// =============================================================
import { Navigate, useNavigate } from "react-router-dom";
import FigmaClickable from "../components/FigmaClickable";
import Icon from "../components/Icon";
import MobileFrame from "../components/MobileFrame";
import { useBooking } from "../context/BookingContext";
import type { Service } from "../data/services";

const assetPathPrefix = "/figma-assets/543b4a3c-d49f-4b2d-9e56-ba0bed5f1516";
const imgContainer = `${assetPathPrefix}/4c496.svg`;
const imgContainer1 = `${assetPathPrefix}/85fb2.svg`;
const imgContainer2 = `${assetPathPrefix}/3a5e9.svg`;
const imgContainer3 = `${assetPathPrefix}/6d4ac.svg`;
const imgContainer4 = `${assetPathPrefix}/92478.svg`;
const imgContainer5 = `${assetPathPrefix}/98aad.svg`;
const imgContainer6 = `${assetPathPrefix}/0b223.svg`;
const imgContainer7 = `${assetPathPrefix}/c9742.svg`;
const imgContainer8 = `${assetPathPrefix}/4e4ae.svg`;
const imgContainer9 = `${assetPathPrefix}/aae24.svg`;
const imgContainer10 = `${assetPathPrefix}/1d982.svg`;
const imgSymbol = `${assetPathPrefix}/1bbb1.svg`;
const imgSymbol1 = `${assetPathPrefix}/f4f0e.svg`;
const imgContainer11 = `${assetPathPrefix}/09271.svg`;
const imgContainer12 = `${assetPathPrefix}/bd9ab.svg`;

function JourneyDetailsScreen({ service }: { service: Service }) {
  return (
    <div className="border border-[#f1f5f9] border-solid content-stretch flex flex-col items-start pb-[188.5px] pt-px px-px relative shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] size-full" data-node-id="6:1493" style={{ backgroundImage: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgb(241, 245, 249) 0%, rgb(241, 245, 249) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Screen 1 — Journey Details (Completed)">
      <div className="relative shrink-0 w-full" data-node-id="6:1494" data-name="Top Content Area">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
          <div className="bg-white border-[#f1f5f9] border-b border-solid content-stretch flex items-center justify-between pb-[9px] pt-[10px] px-[20px] relative shrink-0 w-full" data-node-id="6:1495" data-name="Screen Navigation">
            <div className="relative rounded-[9999px] shrink-0 size-[36px]" data-node-id="6:1496" data-name="Button - Go Back">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
                <div className="h-[14px] relative shrink-0 w-[8px]" data-node-id="6:1497" data-name="Container">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer} />
                </div>
              </div>
            </div>
            <div className="relative shrink-0" data-node-id="6:1499" data-name="Heading 1">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#0b2341] text-[16px] tracking-[-0.4px] whitespace-nowrap" data-node-id="6:1500">
                  <p className="leading-[24px]">Journey Details</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-[9999px] shrink-0 size-[36px]" data-node-id="6:1501" data-name="Button - Journey Help">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
                <div className="relative shrink-0 size-[18px]" data-node-id="6:1502" data-name="Container">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer1} />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(248,250,252,0.7)] border-[#f1f5f9] border-b border-solid content-stretch flex flex-col items-start pb-[11px] pt-[10px] px-[24px] relative shrink-0 w-full" data-node-id="6:1504" data-name="Section - Booking Progress Tracker">
            <div className="h-[24px] max-w-[340px] relative shrink-0 w-full" data-node-id="6:1505" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                <div className="absolute content-stretch flex flex-col h-[2px] items-start left-[82.45px] px-[6px] right-[209.03px] top-[11px]" data-node-id="6:1506" data-name="Connector 1:margin">
                  <div className="bg-[#e2e8f0] h-[2px] relative shrink-0 w-full" data-node-id="6:1507" data-name="Connector 1" />
                </div>
                <div className="absolute content-stretch flex flex-col h-[2px] items-start left-[211.13px] px-[6px] right-[80.34px] top-[11px]" data-node-id="6:1508" data-name="Connector 2:margin">
                  <div className="bg-[#e2e8f0] h-[2px] relative shrink-0 w-full" data-node-id="6:1509" data-name="Connector 2" />
                </div>
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[6px] items-center left-0 pr-[4px] top-1/2" data-node-id="6:1510" data-name="Step 1: Journey (Active)">
                  <div className="bg-[#0b2341] content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center pb-[4.5px] pt-[3.5px] relative rounded-[9999px] shrink-0 size-[24px]" data-node-id="6:1511" data-name="Background+Shadow">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" data-node-id="6:1512">
                      <p className="leading-[16px]">1</p>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="6:1513" data-name="Container">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#0b2341] text-[12px] whitespace-nowrap" data-node-id="6:1514">
                      <p className="leading-[16px]">Journey</p>
                    </div>
                  </div>
                </div>
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[6px] items-center left-[130.97px] px-[4px] top-1/2" data-node-id="6:1515" data-name="Step 2: Vehicle">
                  <div className="bg-[#e2e8f0] content-stretch flex items-center justify-center pb-[4.5px] pt-[3.5px] relative rounded-[9999px] shrink-0 size-[24px]" data-node-id="6:1516" data-name="Background">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[12px] text-center whitespace-nowrap" data-node-id="6:1517">
                      <p className="leading-[16px]">2</p>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="6:1518" data-name="Container">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[12px] whitespace-nowrap" data-node-id="6:1519">
                      <p className="leading-[16px]">Vehicle</p>
                    </div>
                  </div>
                </div>
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[6px] items-center left-[259.66px] pl-[4px] top-1/2" data-node-id="6:1520" data-name="Step 3: Confirm">
                  <div className="bg-[#e2e8f0] content-stretch flex items-center justify-center pb-[4.5px] pt-[3.5px] relative rounded-[9999px] shrink-0 size-[24px]" data-node-id="6:1521" data-name="Background">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[12px] text-center whitespace-nowrap" data-node-id="6:1522">
                      <p className="leading-[16px]">3</p>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="6:1523" data-name="Container">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[12px] whitespace-nowrap" data-node-id="6:1524">
                      <p className="leading-[16px]">Confirm</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[14px] items-start p-[16px] relative shrink-0 w-full" data-node-id="6:1525" data-name="Main Form Area">
            <div className="bg-white border border-[#e2e8f0] border-solid content-stretch flex flex-col gap-[5px] items-start overflow-clip pl-[17px] pr-[15px] py-[15px] relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-node-id="6:1526" data-name="Section - SelectedServiceCard">
              <div className="relative shrink-0 w-full" data-node-id="6:1527" data-name="Container">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative size-full">
                  <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="6:1528" data-name="Container">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-node-id="6:1529" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[11px] tracking-[0.55px] uppercase whitespace-nowrap" data-node-id="6:1530">
                        <p className="leading-[16.5px]">SELECTED SERVICE</p>
                      </div>
                      <div className="bg-[#10b981] relative rounded-[9999px] shrink-0 size-[6px]" data-node-id="6:1531" data-name="Background" />
                    </div>
                    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-node-id="6:1532" data-name="Margin">
                      <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-node-id="6:1533" data-name="Container">
                        <div className="relative shrink-0 size-[20px] text-[#0b2341]" data-node-id="6:1534" data-name="Container">
                          <Icon name={service.icon} size={20} />
                        </div>
                        <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="6:1536" data-name="Heading 2">
                          <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#0b2341] text-[16px] whitespace-nowrap" data-node-id="6:1537">
                            <p className="leading-[24px]" data-testid="journey-service-title">{service.title}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] border-solid content-stretch flex gap-[6px] items-center px-[13px] py-[5px] relative rounded-[8px] shrink-0" data-node-id="6:1538" data-name="Change Button">
                    <div className="relative shrink-0" data-node-id="6:1539" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
                        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#334155] text-[12px] text-center whitespace-nowrap" data-node-id="6:1540">
                          <p className="leading-[16px]">Change</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-[10px] relative shrink-0 w-[8.75px]" data-node-id="6:1541" data-name="Container">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer3} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0 w-full" data-node-id="6:1543" data-name="Container">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                  <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[12px] w-full" data-node-id="6:1544">
                    <p className="leading-[16.5px]" data-testid="journey-service-description">{service.description}</p>
                  </div>
                </div>
              </div>
              <div className="absolute bg-[#0b2341] bottom-0 left-0 top-0 w-[4px]" data-node-id="6:1545" data-name="Left border accent" />
            </div>
            <div className="content-stretch flex flex-col gap-[14px] items-start relative shrink-0 w-full" data-node-id="6:1546" data-name="JourneyCompletedForm">
              <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-node-id="6:1547" data-name="Pickup Location">
                <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="6:1548" data-name="Container">
                  <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="6:1549" data-name="Label">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[12px] whitespace-nowrap" data-node-id="6:1550">
                      <p>
                        <span className="leading-[16px]">{`Pickup Location `}</span>
                        <span className="[word-break:break-word] font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#dc2626]">*</span>
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex gap-[3.99px] items-center relative shrink-0" data-node-id="6:1551" data-name="Button">
                    <div className="h-[10.838px] relative shrink-0 w-[12.375px]" data-node-id="6:1552" data-name="Container">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer4} />
                    </div>
                    <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="6:1554" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#2563eb] text-[12px] text-center whitespace-nowrap" data-node-id="6:1555">
                        <p className="leading-[16px]">Search / Map</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex items-center relative shrink-0 w-full" data-node-id="6:1556" data-name="Container">
                  <div className="bg-white border border-[#cbd5e1] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip px-[37px] py-[11px] relative rounded-[12px]" data-node-id="6:1557" data-name="Input">
                    <div className="relative shrink-0 w-full" data-node-id="6:1558" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-auto relative rounded-[inherit] size-full">
                        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[12px] w-full" data-node-id="6:1559">
                          <p className="leading-[16px]">Manchester Piccadilly Station, M1 2PB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute content-stretch flex items-center justify-center left-[12px] top-[7px]" data-node-id="6:1560" data-name="Container">
                    <div className="relative shrink-0 size-[16px]" data-node-id="6:1561" data-name="Container">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer5} />
                    </div>
                  </div>
                  <div className="absolute h-[18px] right-[12px] top-[7px] w-[14px]" data-node-id="6:1563" data-name="Container">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer6} />
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0 w-full" data-node-id="6:1565" data-name="Container">
                  <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[11px] w-full" data-node-id="6:1566">
                    <p className="leading-[16.5px]">Driver will meet passenger at Station Car Park Pick-up Zone</p>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-node-id="6:1567" data-name="Swap Indicator / Connecting Node">
                <div className="bg-white border border-[#cbd5e1] border-solid content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center p-px relative rounded-[9999px] shrink-0 size-[28px]" data-node-id="6:1568" data-name="Button - Invert Pickup and Destination">
                  <div className="h-[12px] relative shrink-0 w-[13.5px]" data-node-id="6:1569" data-name="Container">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer7} />
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-node-id="6:1571" data-name="Destination Location">
                <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="6:1572" data-name="Container">
                  <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="6:1573" data-name="Label">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[12px] whitespace-nowrap" data-node-id="6:1574">
                      <p>
                        <span className="leading-[16px]">{`Destination `}</span>
                        <span className="[word-break:break-word] font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#dc2626]">*</span>
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-node-id="6:1575" data-name="Button">
                    <div className="relative shrink-0 size-[11px]" data-node-id="6:1576" data-name="Container">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer8} />
                    </div>
                    <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="6:1578" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#2563eb] text-[12px] text-center whitespace-nowrap" data-node-id="6:1579">
                        <p className="leading-[16px]">Search / Map</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex items-center relative shrink-0 w-full" data-node-id="6:1580" data-name="Container">
                  <div className="bg-white border border-[#cbd5e1] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip px-[37px] py-[11px] relative rounded-[12px]" data-node-id="6:1581" data-name="Input">
                    <div className="relative shrink-0 w-full" data-node-id="6:1582" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-auto relative rounded-[inherit] size-full">
                        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[12px] w-full" data-node-id="6:1583">
                          <p className="leading-[16px]">Manchester Airport Terminal 2, M90 4FF</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute content-stretch flex items-center justify-center left-[12px] top-[9px]" data-node-id="6:1584" data-name="Container">
                    <div className="h-[14px] relative shrink-0 w-[17.5px]" data-node-id="6:1585" data-name="Container">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer9} />
                    </div>
                  </div>
                  <div className="absolute h-[18px] right-[12px] top-[7px] w-[14px]" data-node-id="6:1587" data-name="Container">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer10} />
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0 w-full" data-node-id="6:1589" data-name="Container">
                  <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[11px] w-full" data-node-id="6:1590">
                    <p className="leading-[16.5px]">Drop-off located directly outside Departures Upper Forecourt</p>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex gap-[12px] items-start justify-center pt-[4px] relative shrink-0 w-full" data-node-id="6:1591" data-name="Date & Time Grid">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-node-id="6:1592" data-name="Journey Date">
                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="6:1593" data-name="Label">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[12px] w-full" data-node-id="6:1594">
                      <p>
                        <span className="leading-[16px]">{`Journey Date `}</span>
                        <span className="[word-break:break-word] font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#dc2626]">*</span>
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center relative shrink-0 w-full" data-node-id="6:1595" data-name="Container">
                    <div className="bg-white border border-[#cbd5e1] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip pl-[33px] pr-[11px] py-[11px] relative rounded-[12px]" data-node-id="6:1596" data-name="Input">
                      <div className="relative shrink-0 w-full" data-node-id="6:1597" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-auto relative rounded-[inherit] size-full">
                          <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[12px] w-full" data-node-id="6:1598">
                            <p className="leading-[16px]">25/11/2026</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute h-[12px] left-[12px] top-[16px] w-[10.5px]" data-node-id="6:1599" data-name="Symbol">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSymbol} />
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0 w-full" data-node-id="6:1600" data-name="Container">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[11px] w-full" data-node-id="6:1601">
                      <p className="leading-[16.5px]">Wednesday</p>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-node-id="6:1602" data-name="Journey Time">
                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="6:1603" data-name="Label">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[12px] w-full" data-node-id="6:1604">
                      <p>
                        <span className="leading-[16px]">{`Journey Time `}</span>
                        <span className="[word-break:break-word] font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#dc2626]">*</span>
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center relative shrink-0 w-full" data-node-id="6:1605" data-name="Container">
                    <div className="bg-white border border-[#cbd5e1] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip pl-[33px] pr-[11px] py-[11px] relative rounded-[12px]" data-node-id="6:1606" data-name="Input">
                      <div className="relative shrink-0 w-full" data-node-id="6:1607" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-auto relative rounded-[inherit] size-full">
                          <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#1e293b] text-[12px] w-full" data-node-id="6:1608">
                            <p className="leading-[16px]">14:30</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-[12px] size-[12px] top-[16px]" data-node-id="6:1609" data-name="Symbol">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSymbol1} />
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0 w-full" data-node-id="6:1610" data-name="Container">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[11px] w-full" data-node-id="6:1611">
                      <p className="leading-[16.5px]">GMT (Local)</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-center pt-[40px] relative shrink-0 w-full" data-node-id="6:1612" data-name="Complimentary Wait Time Benefit">
                <div className="bg-[#0b2341] content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[8px] items-center justify-center px-[16px] py-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="6:1613" data-name="Button">
                  <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="6:1614" data-name="Container">
                    <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap" data-node-id="6:1615">
                      <p className="leading-[20px]">Continue to Vehicle Selection</p>
                    </div>
                  </div>
                  <div className="h-[9px] relative shrink-0 w-[10.5px]" data-node-id="6:1616" data-name="Container">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer11} />
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start pt-[12px] relative shrink-0" data-node-id="6:1618" data-name="Button:margin">
                  <div className="content-stretch flex gap-[6px] items-center py-[6px] relative shrink-0" data-node-id="6:1619" data-name="Button">
                    <div className="h-[8.25px] relative shrink-0 w-[9.625px]" data-node-id="6:1620" data-name="Container">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer12} />
                    </div>
                    <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="6:1622" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[12px] text-center whitespace-nowrap" data-node-id="6:1623">
                        <p className="leading-[16px]">Back to Service Selection</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JourneyDetailsPage() {
  const navigate = useNavigate();
  const { selectedService } = useBooking();
  // Chưa chọn dịch vụ thì quay về màn chọn dịch vụ
  if (!selectedService) return <Navigate to="/services" replace />;

  const toServices = () => navigate("/services");
  return (
    <MobileFrame height={885.5}>
      <FigmaClickable
        actions={{
          "6:1538": toServices, // Change
          "6:1496": toServices, // Go Back
          "6:1619": toServices, // Back to Service Selection
        }}
      >
        <JourneyDetailsScreen service={selectedService} />
      </FigmaClickable>
    </MobileFrame>
  );
}
