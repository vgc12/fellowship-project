<?php
// This file formats a list of area codes and their corresponding locations into a PHP array format for easy use in a web application.

// Area code string taken from https://www.allareacodes.com/
$areaCodes = "201 - Jersey City, NJ
202 - District of Columbia
203 - Bridgeport, CT
204 - Manitoba
205 - Birmingham, AL
206 - Seattle, WA
207 - Portland, ME
208 - Idaho
209 - Stockton, CA
210 - San Antonio, TX
211 - N11
212 - New York, NY
213 - Los Angeles, CA
214 - Dallas, TX
215 - Philadelphia, PA
216 - Cleveland, OH
217 - Springfield, IL
218 - Duluth, MN
219 - Hammond, IN
220 - Newark, OH
223 - Lancaster, PA
224 - Elgin, IL
225 - Baton Rouge, LA
226 - London, ON
227 - Germantown, MD
228 - Gulfport, MS
229 - Albany, GA
231 - Muskegon, MI
234 - Akron, OH
235 - Columbia, MO
236 - Vancouver, BC
239 - Cape Coral, FL
240 - Germantown, MD
242 - Bahamas
246 - Barbados
248 - Troy, MI
249 - Sudbury, ON
250 - Kelowna, BC
251 - Mobile, AL
252 - Greenville, NC
253 - Tacoma, WA
254 - Killeen, TX
256 - Huntsville, AL
257 - Vancouver, BC
260 - Fort Wayne, IN
262 - Kenosha, WI
263 - Montreal, QC
264 - Anguilla
267 - Philadelphia, PA
268 - Antigua/barbuda
269 - Kalamazoo, MI
270 - Bowling Green, KY
272 - Scranton, PA
274 - Green Bay, WI
276 - Bristol, VA
279 - Sacramento, CA
281 - Houston, TX
283 - Cincinnati, OH
284 - British Virgin Islands
289 - Hamilton, ON 
301 - Germantown, MD
302 - Delaware
303 - Denver, CO
304 - West Virginia
305 - Miami, FL
306 - Saskatchewan
307 - Wyoming
308 - Grand Island, NE
309 - Peoria, IL
310 - Los Angeles, CA
311 - N11
312 - Chicago, IL
313 - Detroit, MI
314 - St. Louis, MO
315 - Syracuse, NY
316 - Wichita, KS
317 - Indianapolis, IN
318 - Shreveport, LA
319 - Cedar Rapids, IA
320 - St. Cloud, MN
321 - Orlando, FL
323 - Los Angeles, CA
324 - Jacksonville, FL
325 - Abilene, TX
326 - Dayton, OH
327 - Jonesboro, AR
329 - New City, NY
330 - Akron, OH
331 - Aurora, IL
332 - New York, NY
334 - Montgomery, AL
336 - Greensboro, NC
337 - Lafayette, LA
339 - Boston, MA
340 - Virgin Islands
341 - Oakland, CA
343 - Ottawa, ON
345 - Cayman Islands
346 - Houston, TX
347 - New York, NY
350 - Stockton, CA
351 - Lowell, MA
352 - Gainesville, FL
353 - Madison, WI
354 - Granby, QC
357 - Fresno, CA
360 - Vancouver, WA
361 - Corpus Christi, TX
363 - Hempstead, NY
364 - Bowling Green, KY
365 - Hamilton, ON
367 - Quebec, QC
368 - Calgary, AB
369 - Santa Rosa, CA
380 - Columbus, OH
382 - London, ON
385 - Salt Lake City, UT
386 - Palm Coast, FL
401 - Providence, RI
402 - Omaha, NE
403 - Calgary, AB
404 - Atlanta, GA
405 - Oklahoma City, OK
406 - Montana
407 - Orlando, FL
408 - San Jose, CA
409 - Beaumont, TX
410 - Baltimore, MD
411 - N11
412 - Pittsburgh, PA
413 - Springfield, MA
414 - Milwaukee, WI
415 - San Francisco, CA
416 - Toronto, ON
417 - Springfield, MO
418 - Quebec, QC
419 - Toledo, OH
423 - Chattanooga, TN
424 - Los Angeles, CA
425 - Bellevue, WA
428 - New Brunswick
430 - Tyler, TX
431 - Manitoba
432 - Midland, TX
434 - Lynchburg, VA
435 - St. George, UT
436 - Parma, OH
437 - Toronto, ON
438 - Montreal, QC
440 - Parma, OH
441 - Bermuda
442 - Oceanside, CA
443 - Baltimore, MD
445 - Philadelphia, PA
447 - Springfield, IL
448 - Tallahassee, FL
450 - Granby, QC
457 - Shreveport, LA
458 - Eugene, OR
463 - Indianapolis, IN
464 - Cicero, IL
468 - Sherbrooke, QC
469 - Dallas, TX
470 - Atlanta, GA
472 - Fayetteville, NC
473 - Grenada
474 - Saskatchewan
475 - Bridgeport, CT
478 - Macon, GA
479 - Fort Smith, AR
480 - Phoenix, AZ
483 - Montgomery, AL
484 - Allentown, PA
500 - Non-Geographic Services
501 - Little Rock, AR
502 - Louisville, KY
503 - Portland, OR
504 - New Orleans, LA
505 - Albuquerque, NM
506 - New Brunswick
507 - Rochester, MN
508 - Worcester, MA
509 - Spokane, WA
510 - Oakland, CA
511 - N11
512 - Austin, TX
513 - Cincinnati, OH
514 - Montreal, QC
515 - Des Moines, IA
516 - Hempstead, NY
517 - Lansing, MI
518 - Albany, NY
519 - London, ON
520 - Tucson, AZ
521 - Non-Geographic Services
522 - Non-Geographic Services
523 - Non-Geographic Services
524 - Non-Geographic Services
525 - Non-Geographic Services
526 - Non-Geographic Services
527 - Non-Geographic Services
528 - Non-Geographic Services
529 - Non-Geographic Services
530 - Redding, CA
531 - Omaha, NE
533 - Non-Geographic Services
534 - Eau Claire, WI
539 - Tulsa, OK
540 - Roanoke, VA
541 - Eugene, OR
544 - Non-Geographic Services
548 - London, ON
551 - Jersey City, NJ
557 - St. Louis, MO
559 - Fresno, CA
561 - West Palm Beach, FL
562 - Long Beach, CA
563 - Davenport, IA
564 - Seattle, WA
566 - Non-Geographic Services
567 - Toledo, OH
570 - Scranton, PA
571 - Arlington, VA
572 - Oklahoma City, OK
573 - Columbia, MO
574 - South Bend, IN
575 - Las Cruces, NM
577 - Non-Geographic Services
579 - Granby, QC
580 - Lawton, OK
581 - Quebec, QC
582 - Erie, PA
584 - Manitoba
585 - Rochester, NY
586 - Warren, MI
587 - Calgary, AB
588 - Non-Geographic Services
600 - Canadian Non-Geographic Tariffed Services
601 - Jackson, MS
602 - Phoenix, AZ
603 - New Hampshire
604 - Vancouver, BC
605 - South Dakota
606 - Ashland, KY
607 - Binghamton, NY
608 - Madison, WI
609 - Trenton, NJ
610 - Allentown, PA
611 - N11
612 - Minneapolis, MN
613 - Ottawa, ON
614 - Columbus, OH
615 - Nashville, TN
616 - Grand Rapids, MI
617 - Boston, MA
618 - Belleville, IL
619 - San Diego, CA
620 - Hutchinson, KS
621 - Houston, TX
622 - Canadian Non-Geographic Services
623 - Phoenix, AZ
624 - Buffalo, NY
626 - Pasadena, CA
628 - San Francisco, CA
629 - Nashville, TN
630 - Aurora, IL
631 - Brentwood, NY
633 - Canadian Non-Geographic Services
636 - O'Fallon, MO
639 - Saskatchewan
640 - Trenton, NJ
641 - Mason City, IA
645 - Miami, FL
646 - New York, NY
647 - Toronto, ON
649 - Turks & Caicos Islands
650 - San Mateo, CA
651 - St. Paul, MN
656 - Tampa, FL
657 - Anaheim, CA
658 - Jamaica
659 - Birmingham, AL
660 - Sedalia, MO
661 - Bakersfield, CA
662 - Southaven, MS
664 - Montserrat
667 - Baltimore, MD
669 - San Jose, CA
670 - Northern Mariana Islands
671 - Guam
672 - Vancouver, BC
678 - Atlanta, GA
679 - Detroit, MI
680 - Syracuse, NY
681 - West Virginia
682 - Fort Worth, TX
683 - Sudbury, ON
684 - American Samoa
686 - Richmond, VA
689 - Orlando, FL
700 - Interexchange Carrier Services
701 - North Dakota
702 - Las Vegas, NV
703 - Arlington, VA
704 - Charlotte, NC
705 - Sudbury, ON
706 - Augusta, GA
707 - Santa Rosa, CA
708 - Cicero, IL
709 - Newfoundland/Labrador
710 - US Government
711 - N11
712 - Sioux City, IA
713 - Houston, TX
714 - Anaheim, CA
715 - Eau Claire, WI
716 - Buffalo, NY
717 - Lancaster, PA
718 - New York, NY
719 - Colorado Springs, CO
720 - Denver, CO
721 - Sint Maarten
724 - New Castle, PA
725 - Las Vegas, NV
726 - San Antonio, TX
727 - St. Petersburg, FL
728 - West Palm Beach, FL
729 - Chattanooga, TN
730 - Belleville, IL
731 - Jackson, TN
732 - Toms River, NJ
734 - Ann Arbor, MI
737 - Austin, TX
738 - Los Angeles, CA
740 - Newark, OH
742 - Hamilton, ON
743 - Greensboro, NC
747 - Los Angeles, CA
748 - Fort Collins, CO
753 - Ottawa, ON
754 - Fort Lauderdale, FL
757 - Virginia Beach, VA
758 - St.lucia
760 - Oceanside, CA
762 - Augusta, GA
763 - Brooklyn Park, MN
765 - Muncie, IN
767 - Dominica
769 - Jackson, MS
770 - Roswell, GA
771 - District of Columbia
772 - Port St. Lucie, FL
773 - Chicago, IL
774 - Worcester, MA
775 - Reno, NV
778 - Vancouver, BC
779 - Rockford, IL
780 - Edmonton, AB
781 - Boston, MA
782 - Nova Scotia/PE Island
784 - St. Vincent & Grenadines
785 - Topeka, KS
786 - Miami, FL
787 - Puerto Rico
800 - Toll-Free
801 - Salt Lake City, UT
802 - Vermont
803 - Columbia, SC
804 - Richmond, VA
805 - Oxnard, CA
806 - Lubbock, TX
807 - Kenora, ON
808 - Hawaii
809 - Dominican Republic
810 - Flint, MI
811 - N11
812 - Evansville, IN
813 - Tampa, FL
814 - Erie, PA
815 - Rockford, IL
816 - Kansas City, MO
817 - Fort Worth, TX
818 - Los Angeles, CA
819 - Sherbrooke, QC
820 - Oxnard, CA
821 - Greenville, SC
825 - Calgary, AB
826 - Roanoke, VA
828 - Asheville, NC
829 - Dominican Republic
830 - New Braunfels, TX
831 - Salinas, CA
832 - Houston, TX
833 - Toll-Free
835 - Allentown, PA
837 - Redding, CA
838 - Albany, NY
839 - Columbia, SC
840 - San Bernardino, CA
843 - Charleston, SC
844 - Toll-Free
845 - New City, NY
847 - Elgin, IL
848 - Toms River, NJ
849 - Dominican Republic
850 - Tallahassee, FL
854 - Charleston, SC
855 - Toll-Free
856 - Camden, NJ
857 - Boston, MA
858 - San Diego, CA
859 - Lexington-Fayette, KY
860 - Hartford, CT
861 - Peoria, IL
862 - Newark, NJ
863 - Lakeland, FL
864 - Greenville, SC
865 - Knoxville, TN
866 - Toll-Free
867 - Northern Canada
868 - Trinidad & Tobago
869 - St. Kitts & Nevis
870 - Jonesboro, AR
872 - Chicago, IL
873 - Sherbrooke, QC
876 - Jamaica
877 - Toll-Free
878 - Pittsburgh, PA
879 - Newfoundland/Labrador
888 - Toll-Free
900 - Premium Services
901 - Memphis, TN
902 - Nova Scotia/PE Island
903 - Tyler, TX
904 - Jacksonville, FL
905 - Hamilton, ON
906 - Marquette, MI
907 - Alaska
908 - Elizabeth, NJ
909 - San Bernardino, CA
910 - Fayetteville, NC
911 - N11
912 - Savannah, GA
913 - Overland Park, KS
914 - Yonkers, NY
915 - El Paso, TX
916 - Sacramento, CA
917 - New York, NY
918 - Tulsa, OK
919 - Raleigh, NC
920 - Green Bay, WI
924 - Rochester, MN
925 - Concord, CA
928 - Yuma, AZ
929 - New York, NY
930 - Evansville, IN
931 - Clarksville, TN
934 - Brentwood, NY
936 - Conroe, TX
937 - Dayton, OH
938 - Huntsville, AL
939 - Puerto Rico
940 - Denton, TX
941 - North Port, FL
942 - Toronto, ON
943 - Atlanta, GA
945 - Dallas, TX
947 - Troy, MI
948 - Virginia Beach, VA
949 - Irvine, CA
951 - Riverside, CA
952 - Bloomington, MN
954 - Fort Lauderdale, FL
956 - Laredo, TX
959 - Hartford, CT
970 - Fort Collins, CO
971 - Portland, OR
972 - Dallas, TX
973 - Newark, NJ
975 - Kansas City, MO
978 - Lowell, MA
979 - College Station, TX
980 - Charlotte, NC
983 - Denver, CO
984 - Raleigh, NC
985 - Houma, LA
986 - Idaho
989 - Saginaw, MI";

// Splits the string into an array of area codes
$areaCodesArray = explode("\n", $areaCodes);


for ($i = 0; $i < count($areaCodesArray); $i++) {
    // Replace the " - " with " => " to format it as a PHP array
    $areaCodesArray[$i] = str_replace(" - ", "\" => \"", $areaCodesArray[$i]);
    // output to the page for copying
    echo "<div>\"$areaCodesArray[$i]\",</div>";
}

