import socket from "./socket"
import { RacerController } from "./racer_controller"
import HandlebarsResolver from "./handlebars_resolver"

export var MatchController = {
  randoomText: "",

  validateKeyWord: function(textRandoom){
    let lastWord = 0
    let textCurent = ""
    let nextWord = 0
    let score = 0
    let textArea = textRandoom
    //console.log(textRandoom)
    let statusDead = 1
    $("#currentWord").text(textArea.charAt(nextWord))
    lastWord = textArea.length
    $("#pressKey").on("keydown", (event)=>{
      let notDead = 1
      if (textArea.charAt(nextWord) === " "){
       // console.log("Espacio")
        $("#currentWord").text("Espacio")
        $("#pressKey").val("")
      }
      if (event.key === 'Dead' && statusDead == 1){
        $("#currentWord").text(textArea.charAt(nextWord))
        textCurent +=textArea.charAt(nextWord)
        nextWord +=1
        notDead = 0
      }
      else {
        $("#currentWord").text(textArea.charAt(nextWord))
      }
      //console.log(`Presiona : ${event.key}, Numero de palabra: ${nextWord} , Letra del parrafo: ${textArea.charAt(nextWord)}`)
      if(event.key == textArea.charAt(nextWord) && notDead == 1){
        textCurent +=textArea.charAt(nextWord)
        nextWord +=1
        score = (nextWord * 100) / (textArea.length)
        RacerController.sendScore(score)
        if (score > 90.0){
          RacerController.sendPosition()
        }
        //console.log(`Texto actual: ${textCurent} cadena:  ${textArea.substring(nextWord)}`)
        $("#textCurrent").text(textCurent)
        $("#textToValidate").text(textArea.substring(nextWord))
        $("#pressKey").removeClass("error")
      } else {
        $("#pressKey").addClass("error") 
      }
      //console.log(event)
    })


  },

  bindEvents:function (){
    console.log("init envents from MatchControllet")
  
  },

  start: function(){
    this.bindEvents()
  }

}

