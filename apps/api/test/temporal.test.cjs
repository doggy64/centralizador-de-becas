const {temporalStatus}=require("../dist/temporal");
const now=new Date("2027-01-10T04:10:00Z");
const base={startDate:"2027-01-01",deadlineDay:"2027-01-10",timeZone:"America/La_Paz",deadlineAt:null,lastVerifiedAt:now};
test.each([
 [{}, "OPEN"],[{startDate:"2027-01-12"},"UPCOMING"],[{deadlineDay:"2027-01-09"},"CLOSED"],[{timeZone:null},"TO_CONFIRM"],[{deadlineDay:null},"TO_CONFIRM"],[{lastVerifiedAt:new Date("2026-01-01")},"TO_CONFIRM"],[{deadlineDay:null,deadlineAt:new Date("2027-01-10T04:09Z")},"CLOSED"]
])("estado con fechas %j", (patch,status)=>expect(temporalStatus({...base,...patch},now)).toBe(status));
