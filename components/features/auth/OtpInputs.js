import { useEffect , useRef} from "react";
import styles from "./OtpInputs.module.css";

export default function OtpInputs({otp , setOtp}) {
  const inputRefs = useRef([]);

  

  useEffect(()=> {
    if(inputRefs.current[0]){
        inputRefs.current[0].focus()
    }
  } , [])

  const handleChangeInput = (e , index) => {
    const value = e.target.value

    if(value.length == 1) {
        const updateOtp = [...otp]
        updateOtp[index] = value
        setOtp(updateOtp)

        if(index < 4){
            inputRefs.current[index+1].focus()
        }
    }
  }

  const handleBackSpace = (e , index) => {
    if(e.key == "Backspace") {
        if(otp[index] == "" && index>0) {
            const updateOtp = [...otp]
            updateOtp[index - 1] = ""
            setOtp(updateOtp)

            inputRefs.current[index-1].focus()
        } else{
            const updateOtp = [...otp]
            updateOtp[index] = ""
            setOtp(updateOtp)
        }
    }
  }


  return (
    <div className={styles.otpInputWrapper}>
      <input
        type="text"
        className={styles.otpInput}
        inputMode="numeric"
        maxLength={1}
        ref={(el) => inputRefs.current[0]=el}
        onChange={(e)=>handleChangeInput(e , 0)}
        onKeyDown={(e)=>handleBackSpace(e , 0)}
        value={otp[0]}
      />
      <input
        type="text"
        className={styles.otpInput}
        inputMode="numeric"
        maxLength={1}
        ref={(el) => inputRefs.current[1]=el}
        onChange={(e)=>handleChangeInput(e , 1)}
        onKeyDown={(e)=>handleBackSpace(e , 1)}
        value={otp[1]}
      />
      <input
        type="text"
        className={styles.otpInput}
        inputMode="numeric"
        maxLength={1}
        ref={(el) => inputRefs.current[2]=el}
        onChange={(e)=>handleChangeInput(e , 2)}
        onKeyDown={(e)=>handleBackSpace(e , 2)}
        value={otp[2]}
      />
      <input
        type="text"
        className={styles.otpInput}
        inputMode="numeric"
        maxLength={1}
        ref={(el) => inputRefs.current[3]=el}
        onChange={(e)=>handleChangeInput(e , 3)}
        onKeyDown={(e)=>handleBackSpace(e , 3)}
        value={otp[3]}
      />
      <input
        type="text"
        className={styles.otpInput}
        inputMode="numeric"
        maxLength={1}
        ref={(el) => inputRefs.current[4]=el}
        onChange={(e)=>handleChangeInput(e , 4)}
        onKeyDown={(e)=>handleBackSpace(e , 4)}
        value={otp[4]}
      />
    </div>
  );
}
