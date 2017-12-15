!verbose push
!verbose 4
!echo "Loading Common Utils"
!verbose pop

# avoid exit code 2
!macro quitSuccess
  SetErrorLevel 0
  Quit
!macroend
