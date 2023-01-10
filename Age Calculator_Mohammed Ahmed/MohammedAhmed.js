function age(){
    let day = document.getElementById('day').value;
    let month = document.getElementById('month').value;
    let year = document.getElementById('year').value;

    let date = new Date(); // Fri Jun 17 2022 21:54:39 GMT+0100 (UTC+01:00)
    let get_day = date.getDate(); // 17
    let get_month = 1 + date.getMonth(); // 6
    let get_year = date.getFullYear(); // 2022

    let all_month = [31,28,31,30,31,30,31,31,20,31,30,31];

    if(day > get_day){
        get_day = get_day+all_month[get_month - 1];
        get_day = get_day -1 ;

    }

    if(month > get_month){
        get_month = get_month +12;
        get_year = get_year-1;
    }

    let d = get_day-day;
    let m = get_month-month;
    let y = get_year - year;
   
    document.getElementById('age').innerHTML = 'Your Age is '+y+
    ' Years <br> Next date of birth after '+m+ ' Months and '+d+ ' days';


}











    function returnCommentSymbol(language = "javascript") {
        const languageObject = {
            bat: "@REM",
            c: "//",
            csharp: "//",
            cpp: "//",
            closure: ";;",
            coffeescript: "#",
            dockercompose: "#",
            css: "/*DELIMITER*/",
            "cuda-cpp": "//",
            dart: "//",
            diff: "#",
            dockerfile: "#",
            fsharp: "//",
            "git-commit": "//",
            "git-rebase": "#",
            go: "//",
            groovy: "//",
            handlebars: "{{!--DELIMITER--}}",
            hlsl: "//",
            html: "<!--DELIMITER-->",
            ignore: "#",
            ini: ";",
            java: "//",
            javascript: "//",
            javascriptreact: "//",
            json: "//",
            jsonc: "//",
            julia: "#",
            latex: "%",
            less: "//",
            lua: "--",
            makefile: "#",
            markdown: "<!--DELIMITER-->",
            "objective-c": "//",
            "objective-cpp": "//",
            perl: "#",
            perl6: "#",
            php: "<!--DELIMITER-->",
            powershell: "#",
            properties: ";",
            jade: "//-",
            python: "#",
            r: "#",
            razor: "<!--DELIMITER-->",
            restructuredtext: "..",
            ruby: "#",
            rust: "//",
            scss: "//",
            shaderlab: "//",
            shellscript: "#",
            sql: "--",
            svg: "<!--DELIMITER-->",
            swift: "//",
            tex: "%",
            typescript: "//",
            typescriptreact: "//",
            vb: "'",
            xml: "<!--DELIMITER-->",
            xsl: "<!--DELIMITER-->",
            yaml: "#"
        }
        return languageObject[language].split("DELIMITER")
    }
    var savedChPos = 0
    var returnedSuggestion = ''
    let editor, doc, cursor, line, pos
    pos = {line: 0, ch: 0}
    var suggestionsStatus = false
    var docLang = "python"
    document.addEventListener("keydown", (event) => {
    setTimeout(()=>{
        editor = event.target.closest('.CodeMirror');
        const codeEditor = editor.CodeMirror
        if (editor){
            doc = editor.CodeMirror.getDoc()
            cursor = doc.getCursor()
            line = doc.getLine(cursor.line)
            pos = {line: cursor.line, ch: line.length}

            if(cursor.ch > 0){
                savedChPos = cursor.ch
            }

            const fileLang = doc.getMode().name
            docLang = fileLang
            const commentSymbol = returnCommentSymbol(fileLang)
            if (event.key == "?"){
                var lastLine = line
                lastLine = lastLine.slice(0, savedChPos - 1)

                if(lastLine.startsWith(commentSymbol[0])){
                    lastLine += " "+fileLang
                    lastLine = lastLine.split(commentSymbol[0])[1]
                    window.postMessage({source: 'getQuery', payload: { data: lastLine } } )
                    //displayGrey(query)
                }
            }else if(event.key === "Enter" && suggestionsStatus){
                var query = doc.getRange({ line: Math.max(0,cursor.line-10), ch: 0 }, { line: cursor.line, ch: line.length })
                window.postMessage({source: 'getSuggestion', payload: { data: query } } )
            }else if(event.key === "ArrowRight" && returnedSuggestion){
                acceptTab(returnedSuggestion)
            }
        }
    }, 0)
    })

    function acceptTab(text){
    if (suggestionDisplayed){
        doc.replaceRange(text, pos)
        suggestionDisplayed = false
        returnedSuggestion = ""
    }
    }
    function displayGrey(text){
        var el = document.querySelector(".blackbox-suggestion")
        if(!el){
            el = document.createElement('span')
            el.classList.add("blackbox-suggestion")
            el.innerText = text
            el.style = 'color:grey'
        }
        
        var lineIndex = pos.line;
        editor.getElementsByClassName('CodeMirror-line')[lineIndex].appendChild(el)
        suggestionDisplayed = true
    }
    window.addEventListener('message', (event)=>{
    if (event.source !== window ) return
    if (event.data.source == 'return'){
        const formattedCode = formatCode(event.data.payload.data)
        returnedSuggestion = formattedCode
        displayGrey(formattedCode)
    }
    if(event.data.source == 'suggestReturn'){
        returnedSuggestion = event.data.payload.data
        displayGrey(event.data.payload.data)
    }
    if(event.data.source == 'suggestionsStatus'){
        suggestionsStatus = event.data.payload.enabled
    }
    })
    document.addEventListener("keyup", function(){
        returnedSuggestion = ""
    })
    function formatCode(data) {
        if (Array.isArray(data)) {
            var finalCode = ""
            var pairs = []
    
            const commentSymbol = returnCommentSymbol(docLang)
            data.forEach((codeArr, idx) => {
                const code = codeArr[0]
                var desc = codeArr[1]
                const descArr = desc.split("\n")
                var finalDesc = ""
                descArr.forEach((descLine, idx) => {
                    const whiteSpace = descLine.search(/\S/)
                    if (commentSymbol.length < 2 || idx === 0) {
                        finalDesc += insert(descLine, whiteSpace, commentSymbol[0])
                    }
                    if (commentSymbol.length > 1 && idx === descArr.length - 1) {
                        finalDesc = finalDesc + commentSymbol[1] + "\n"
                    }
                })
    
                finalCode += finalDesc + "\n\n" + code
                pairs.push(finalCode)
            })
            return "\n"+pairs.join("\n")
        }
    
        return "\n"+data
    }
    
    function insert(str, index, value) {
        return str.substr(0, index) + value + str.substr(index)
    }