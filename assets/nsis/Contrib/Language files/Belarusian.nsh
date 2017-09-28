;Language: Belarusian (1059)
;Translated by Alexander Koshal [ callmebor@gmail.com ]; Edited by Vital Stanisheuski [ vitstan@gmail.com ]

!insertmacro LANGFILE "Belarusian" = "Беларуская" "Biełaruskaja"

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "Вас вiтае майстар усталявання $(^NameDA)"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "Гэта праграма ўсталюе $(^NameDA) на ваш камп'ютар.$\r$\n$\r$\nПерад тым, як пачаць, пажадана закрыць усе праграмы, якія выконваюцца ў дадзены момант. Гэта дапаможа праграме ўсталявання абнавіць сістэмныя файлы без перазапуску камп'ютара.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "Вас вiтае майстар выдалення $(^NameDA)"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "Гэта праграма выдаліць $(^NameDA) з вашага камп'ютара.$\r$\n$\r$\nПерад тым, як пачаць працэдуру выдалення, пераканайцеся ў тым, што праграма $(^NameDA) не выконваецца.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "Ліцэнзійнае пагадненне"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "Калі ласка, прачытайце ўмовы Ліцэнзійнага пагаднення перад тым, як пачаць $(^NameDA)."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "Калi вы прымаеце ўмовы Лiцэнзiйнага пагаднення, то націсніце кнопку $\"Прымаю$\". Гэта неабходна, каб усталяваць праграму."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "Калi вы прымаеце ўмовы Лiцэнзiйнага пагаднення, пастаўце птушку ніжэй. Гэта неабходна, каб усталяваць праграму. $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Калi вы прымаеце ўмовы Ліцэнзійнага пагаднення, выберыце першы варыянт з прапанаваных ніжэй. Гэта неабходна, каб усталяваць праграму. $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "Ліцэнзійнае пагадненне"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "Калі ласка, прачытайце ўмовы Ліцэнзійнага пагаднення перад пачаткам выдалення $(^NameDA)."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "Калі вы прымаеце ўмовы Ліцэнзійнага пагаднення, націсніце кнопку $\"Прымаю$\". Гэта неабходна для таго, каб выдаліць праграму. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "Калі вы прымаеце ўмовы Ліцэнзійнага пагаднення, пастаўце птушку ніжэй. Гэта неабходна для таго, каб выдаліць праграму. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Калі вы прымаеце ўмовы Ліцэнзійнага пагаднення, выберыце першы варыянт з прапанаваных ніжэй. Гэта неабходна для таго, каб выдаліць праграму. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "Выкарыстоўвайце кнопкi $\"PageUp$\" i $\"PageDown$\" для перамяшчэння па тэксце."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "Кампаненты праграмы, якая ўсталёўваецца"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "Выберыце кампаненты $(^NameDA), якія вы жадаеце ўсталяваць."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "Кампаненты праграмы"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "Выберыце кампаненты $(^NameDA), якія вы жадаеце выдаліць."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "Апісанне"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Усталюйце курсор мышы на назву кампанента, каб прачытаць яго апісанне."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Выберыце кампанент, каб прачытаць яго апісанне."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "Выбар папкі ўсталявання"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "Выберыце папку для ўсталявання $(^NameDA)."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "Выбар папкі для выдалення"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "Выберыце папку, з якой патрэбна выдаліць $(^NameDA)."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "Капіяванне файлаў"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "Пачакайце, калі ласка, выконваецца капіяванне файлаў $(^NameDA) на ваш камп'ютар..."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "Усталяванне завершана"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "Усталяванне паспяхова завершана."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "Усталяванне перарвана"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "Усталяванне не завершана."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "Выдаленне"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "Пачакайце, калі ласка, выконваецца выдаленне файлаў $(^NameDA) з вашага камп'ютара..."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "Выдаленне завершана"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "Выдаленне праграмы паспяхова завершана."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "Выдаленне перапынена"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "Выдаленне выканана не цалкам."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "Сканчэнне працы майстра ўсталявання $(^NameDA)"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "Усталяванне $(^NameDA) выканана.$\r$\n$\r$\nНацісніце кнопку $\"Гатова$\" для таго, каб выйсці з праграмы ўсталявання."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "Каб скончыць усталяванне $(^NameDA), неабходна перазапусціць камп'ютар. Зрабіць гэта зараз?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "Сканчэнне працы майстра выдалення $(^NameDA)"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "Праграма $(^NameDA) выдалена з вашага камп'ютара.$\r$\n$\r$\nНацісніце кнопку $\"Гатова$\", каб выйсці з праграмы выдалення."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "Каб скончыць выдаленне  $(^NameDA), неабходна перазапусціць камп'ютар. Зрабіць гэта зараз?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "Так, перазапусціць камп'ютар зараз"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "Не, перазапусціць камп'ютар пазней"
  ${LangFileString} MUI_TEXT_FINISH_RUN "&Запусціць $(^NameDA)"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Паказаць звесткі пра праграму"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "&Гатова"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "Папка ў меню $\"Пуск$\""
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "Выберыце папку ў меню $\"Пуск$\" для размяшчэння ярлыкоў праграмы."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "Выберыце папку ў меню $\"Пуск$\", куды будуць змешчаны ярлыкі праграмы. Вы таксама можаце азначыць іншае імя папкі."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "Не ствараць ярлыкі"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "Выдаленне $(^NameDA)"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "Выдаленне $(^NameDA) з вашага камп'ютара."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "Вы сапраўды жадаеце скасаваць усталяванне $(^Name)?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "Вы сапраўды жадаеце скасаваць выдаленне $(^Name)?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "Рэжым усталявання"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "Выберыце, для якіх карыстальнікаў будзе усталявана $(^NameDA)."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "Выберыце, ці будзе ўсталявана $(^NameDA) толькі для вас або для ўсіх карыстальнікаў дадзенага камп'ютара. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "Усталяваць для ўсіх карыстальнікаў"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "Усталяваць толькі для бягучага карыстальніка"
!endif
