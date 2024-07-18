export function dropdownShowScrollFunction(event: any): void {
  var offset = 0;
  //console.log(event);
  //console.log(event?.overlay?.lastElementChild?.lastElementChild?.lastElementChild?.offsetHeight, event.overlay.lastElementChild.lastElementChild.lastElementChild.scrollHeight);
  //console.log(event?.overlay?.lastElementChild?.querySelector('.p-dropdown-items-wrapper'));
  let dropdownWrapper = event?.overlay?.lastElementChild?.querySelector('.p-dropdown-items-wrapper');
  //console.log(dropdownWrapper?.offsetHeight, dropdownWrapper?.scrollHeight);
  //Pokud se rovnají není zobrazen scrool a nemusím nic řešit
  if (dropdownWrapper?.offsetHeight == dropdownWrapper?.scrollHeight)
    return;

  var dropdownItems = dropdownWrapper?.querySelectorAll('p-dropdownitem')
  //console.log(dropdownItems);
  dropdownItems.forEach((dropdownItem: any) => {
    //console.log(dropdownItem.firstChild.ariaSelected);
    if (dropdownItem.firstChild.ariaSelected == "true"){
      //console.log(dropdownItem.firstChild.offsetTop, dropdownItem.firstChild.offsetHeight);
      offset = dropdownItem.firstChild.offsetTop - dropdownWrapper.offsetHeight + (2 * dropdownItem.firstChild.offsetHeight);
      return;
    }
  });
  //console.log(offset);
  if (offset >= 0) {
    //console.log(event?.overlay?.lastElementChild?.querySelector('.p-dropdown-items-wrapper'));
    //console.log(dropdownWrapper.scrollTop);
    dropdownWrapper.scrollTop = offset;
    //console.log(dropdownWrapper.scrollTop);
  }
}
