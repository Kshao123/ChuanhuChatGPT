system: 
- You are a helpful assistant. 

user: 
- 将下面这段 python 转换为 node

import json
import re

import httpx

from .base import BaseParser, VideoAuthor, VideoInfo


class DouYin(BaseParser):
    """
    抖音 / 抖音火山版
    """

    async def parse_share_url(self, share_url: str) -> VideoInfo:
        # 支持电脑网页版链接 https://www.douyin.com/video/xxxxxx
        if share_url.startswith("https://www.douyin.com/video/"):
            video_id = share_url.strip("/").split("/")[-1]
            share_url = self._get_request_url_by_video_id(video_id)

        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(share_url, headers=self.get_default_headers())
            response.raise_for_status()

        pattern = re.compile(
            pattern=r"window\._ROUTER_DATA\s*=\s*(.*?)</script>",
            flags=re.DOTALL,
        )
        find_res = pattern.search(response.text)

        if not find_res or not find_res.group(1):
            raise ValueError("parse video json info from html fail")

        json_data = json.loads(find_res.group(1).strip())
        original_video_info = json_data["loaderData"]["video_(id)/page"]["videoInfoRes"]

        # 如果没有视频信息，获取并抛出异常
        if len(original_video_info["item_list"]) == 0:
            err_detail_msg = "failed to parse video info from HTML"
            if len(filter_list := original_video_info["filter_list"]) > 0:
                err_detail_msg = filter_list[0]["detail_msg"]
            raise Exception(err_detail_msg)

        data = original_video_info["item_list"][0]

        # 获取图集图片地址
        images = []
        # 如果data含有 images，并且 images 是一个列表
        if "images" in data and isinstance(data["images"], list):
            # 获取每个图片的url_list中的第一个元素，非空时添加到images列表中
            for img in data["images"]:
                if (
                    "url_list" in img
                    and isinstance(img["url_list"], list)
                    and len(img["url_list"]) > 0
                    and len(img["url_list"][0]) > 0
                ):
                    images.append(img["url_list"][0])

        # 获取视频播放地址
        video_url = data["video"]["play_addr"]["url_list"][0].replace("playwm", "play")
        # 如果图集地址不为空时，因为没有视频，上面抖音返回的视频地址无法访问，置空处理
        if len(images) > 0:
            video_url = ""

        # 获取重定向后的mp4视频地址
        # 图集时，视频地址为空，不处理
        video_mp4_url = ""
        if len(video_url) > 0:
            video_mp4_url = await self.get_video_redirect_url(video_url)

        video_info = VideoInfo(
            video_url=video_mp4_url,
            cover_url=data["video"]["cover"]["url_list"][0],
            title=data["desc"],
            images=images,
            author=VideoAuthor(
                uid=data["author"]["sec_uid"],
                name=data["author"]["nickname"],
                avatar=data["author"]["avatar_thumb"]["url_list"][0],
            ),
        )
        return video_info

    async def get_video_redirect_url(self, video_url: str) -> str:
        async with httpx.AsyncClient(follow_redirects=False) as client:
            response = await client.get(video_url, headers=self.get_default_headers())
        # 返回重定向后的地址，如果没有重定向则返回原地址(抖音中的西瓜视频,重定向地址为空)
        return response.headers.get("location") or video_url

    async def parse_video_id(self, video_id: str) -> VideoInfo:
        req_url = self._get_request_url_by_video_id(video_id)
        return await self.parse_share_url(req_url)

    def _get_request_url_by_video_id(self, video_id) -> str:
        return f"https://www.iesdouyin.com/share/video/{video_id}/"
 

assistant: 
- Here's the Node.js equivalent of the provided Python code:

```javascript
const axios = require('axios');
const cheerio = require('cheerio');

class BaseParser {
  getDefaultHeaders() {
    // Implement this method as needed
  }
}

class VideoAuthor {
  constructor(uid, name, avatar) {
    this.uid = uid;
    this.name = name;
    this.avatar = avatar;
  }
}

class VideoInfo {
  constructor(video_url, cover_url, title, images, author) {
    this.video_url = video_url;
    this.cover_url = cover_url;
    this.title = title;
    this.images = images;
    this.author = author;
  }
}

class DouYin extends BaseParser {
  async parseShareUrl(shareUrl) {
    if (shareUrl.startsWith("https://www.douyin.com/video/")) {
      const videoId = shareUrl.trim("/").split("/").pop();
      shareUrl = this._getRequestUrlByVideoId(videoId);
    }

    const response = await axios.get(shareUrl, {
      headers: this.getDefaultHeaders(),
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);
    const scriptContent = $('script:contains("window._ROUTER_DATA")').html();

    if (!scriptContent) {
      throw new Error("parse video json info from html fail");
    }

    const jsonMatch = scriptContent.match(/window\._ROUTER_DATA\s*=\s*(.*?)<\/script>/s);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error("parse video json info from html fail");
    }

    const jsonData = JSON.parse(jsonMatch[1].trim());
    const originalVideoInfo = jsonData.loaderData["video_(id)/page"].videoInfoRes;

    if (originalVideoInfo.item_list.length === 0) {
      let errDetailMsg = "failed to parse video info from HTML";
      if (originalVideoInfo.filter_list.length > 0) {
        errDetailMsg = originalVideoInfo.filter_list[0].detail_msg;
      }
      throw new Error(errDetailMsg);
    }

    const data = originalVideoInfo.item_list[0];

    const images = [];
    if (data.images && Array.isArray(data.images)) {
      for (const img of data.images) {
        if (img.url_list && Array.isArray(img.url_list) && img.url_list.length > 0 && img.url_list[0].length > 0) {
          images.push(img.url_list[0]);
        }
      }
    }

    let videoUrl = data.video.play_addr.url_list[0].replace("playwm", "play");
    if (images.length > 0) {
      videoUrl = "";
    }

    let videoMp4Url = "";
    if (videoUrl.length > 0) {
      videoMp4Url = await this.getVideoRedirectUrl(videoUrl);
    }

    const videoInfo = new VideoInfo(
      videoMp4Url,
      data.video.cover.url_list[0],
      data.desc,
      images,
      new VideoAuthor(
        data.author.sec_uid,
        data.author.nickname,
        data.author.avatar_thumb.url_list[0]
      )
    );

    return videoInfo;
  }

  async getVideoRedirectUrl(videoUrl) {
    try {
      const response = await axios.get(videoUrl, {
        headers: this.getDefaultHeaders(),
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });
      return response.headers.location || videoUrl;
    } catch (error) {
      if (error.response && error.response.headers.location) {
        return error.response.headers.location;
      }
      return videoUrl;
    }
  }

  async parseVideoId(videoId) {
    const reqUrl = this._getRequestUrlByVideoId(videoId);
    return await this.parseShareUrl(reqUrl);
  }

  _getRequestUrlByVideoId(videoId) {
    return `https://www.iesdouyin.com/share/video/${videoId}/`;
  }
}

module.exports = DouYin;
```

This Node.js version uses `axios` for HTTP requests and `cheerio` for HTML parsing. You'll need to install these dependencies:

```
npm install axios cheerio
```

Note that some adjustments might be necessary depending on your specific use case and environment. Also, make sure to implement the `getDefaultHeaders()` method in the `BaseParser` class according to your needs. 
