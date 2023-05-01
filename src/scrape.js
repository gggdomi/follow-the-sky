// 🔶 1. Setup XHR interception

const originalXHR = window.XMLHttpRequest
const responses = []

window.XMLHttpRequest = function () {
   const xhr = new originalXHR()
   const originalOpen = xhr.open
   const originalSend = xhr.send

   xhr.open = function (method, url) {
      xhr._url = url
      originalOpen.apply(this, arguments)
   }

   xhr.send = function () {
      xhr.addEventListener('readystatechange', () => {
         if (xhr.readyState === 4 && xhr._url.includes('Following')) responses.push(xhr.responseText)
      })

      originalSend.apply(this, arguments)
   }

   return xhr
}

// 🔶 2. Scroll until the end (triggers all XHR queries)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const autoScroll = async () => {
   let prevScrollHeight = document.body.scrollHeight
   let totalScrolled = 0
   const scrollDistance = 100
   const maxScrollRetries = 10
   let retries = 0

   while (retries < maxScrollRetries) {
      window.scrollBy(0, scrollDistance)
      totalScrolled += scrollDistance
      await delay(100)

      if (prevScrollHeight === document.body.scrollHeight) {
         retries++
      } else {
         prevScrollHeight = document.body.scrollHeight
         retries = 0
      }
   }
}

await autoScroll()

// 🔶 3. Extract relevant data as need, and give a convenient way to exfiltrate data (ex: copy to clipboard)
responses.map((r) => {
   const j = JSON.parse(r)
   // ...
})
