export const getRandomFourDigits = () :number=> {
  const randomNum = Math.floor(Math.random() * 10000)
  return randomNum
}