docker build -t chuanhuchatbot:6.0 .

docker run -p 127.0.0.1:7861:7860 -v /Users/a666/Desktop/demo/ai/ChuanhuChatGPT:/app -v /Users/a666/Desktop/demo/ai/ChuanhuChatGPT/docker/gradio:/tmp/gradio chuanhuchatbot:5.0
