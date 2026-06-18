<?php 
require($_SERVER['DOCUMENT_ROOT']."/_function.php");
$lang = get_language();
header("Location: /".$lang."/404/");
?>