import { HttpResponse } from "@angular/common/http";

export function fileDownloadNameFunction(params: HttpResponse<Blob>): string {
  var filename = params.headers.get("content-disposition");

  const regexUtf8 = /filename\*=UTF-8''/g;
  const regex = /filename=/g;
  //console.log("search 1", filename.search(regexUtf8));
  //console.log("search 2", filename.search(regex));
  if (filename) {
    var index = filename?.search(regexUtf8);
    if (index != -1) {
      filename = filename?.substring(index + 17);
    } else {
      index = filename?.search(regex);
      if (index != -1) {
        filename = filename?.substring(index + 9);
      }
    }
    return decodeURI(filename);
  } else {
    return "";
  }
}
